package com.example.backend.service.impl;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.MatchPost;
import com.example.backend.entity.MatchRequest;
import com.example.backend.entity.User;
import com.example.backend.mapper.MatchRequestMapper;
import com.example.backend.repository.MatchPostRepository;
import com.example.backend.repository.MatchRequestRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.service.ConversationService;
import com.example.backend.service.MatchRequestService;
import com.example.backend.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import com.example.backend.exception.AppException;

@AllArgsConstructor
@Service
public class MatchRequestServiceImpl implements MatchRequestService {

    private final MatchRequestRepository matchRequestRepository;
    private final MatchRequestMapper matchRequestMapper;
    private final MatchPostRepository matchPostRepository;
    private final ConversationService conversationService;
    private final ConversationRepository conversationRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private String truncateId(String id) {
        if (id == null || id.isEmpty()) return "Chưa xác định";
        return id.length() >= 6 ? id.substring(0, 6).toUpperCase() : id.toUpperCase();
    }

    @Override
    @Transactional
    public MatchRequestResponse createMatchRequest(MatchRequestCreateRequest request) {
        MatchPost post = matchPostRepository.findById(request.getPostId())
                .orElseThrow(() -> new AppException(404, "Không tìm thấy bài đăng!"));

        if (post.getUserId().equals(request.getRequesterId())) {
            throw new AppException(400, "Không thể tự nhận kèo của chính mình!");
        }

        // Chặn người chơi gửi yêu cầu vào bài đăng đã đóng
        if (post.getStatus() == Enums.PostStatus.CLOSED) {
            throw new AppException(400, "Bài đăng này đã đóng, không thể gửi yêu cầu ghép trận!");
        }

        boolean isAlreadyRequested = matchRequestRepository.existsByPostIdAndRequesterId(
                request.getPostId(),
                request.getRequesterId()
        );

        if (isAlreadyRequested) {
            throw new AppException(400, "Bạn đã gửi yêu cầu nhận kèo cho bài này rồi!");
        }

        MatchRequest matchRequest = matchRequestMapper.toEntity(request);
        matchRequest.setStatus(Enums.RequestStatus.PENDING);
        MatchRequest savedMatchRequest = matchRequestRepository.save(matchRequest);

        User requester = userRepository.findById(request.getRequesterId()).orElse(null);
        String requesterName = requester != null ? requester.getFullName() : "Một người chơi";
        String fieldCode = truncateId(post.getFieldId());

        NotificationCreateRequest notifRequest = new NotificationCreateRequest();
        notifRequest.setTitle("Có lời mời giao hữu mới!");
        notifRequest.setContent(requesterName + " đã gửi yêu cầu nhận kèo của bạn tại sân " + fieldCode);
        notifRequest.setType(Enums.NotificationType.MATCH_REQUEST);
        notificationService.createAndSendNotification(post.getUserId(), notifRequest);

        try {
            boolean chatExists = conversationRepository.findDirectConversationBetweenUsers(
                    Enums.ConversationType.DIRECT,
                    post.getUserId(),
                    request.getRequesterId()
            ).isPresent();

            if (!chatExists) {
                ConversationCreateRequest chatRequest = new ConversationCreateRequest();
                chatRequest.setType(Enums.ConversationType.DIRECT);
                chatRequest.setCreatedAt(LocalDateTime.now());

                conversationService.createDirectConversation(
                        chatRequest,
                        post.getUserId(),
                        request.getRequesterId() 
                );
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi auto-create phòng chat: " + e.getMessage());
        }

        return matchRequestMapper.toResponse(savedMatchRequest);
    }

    @Override
    @Transactional
    public MatchRequestStatusResponse updateRequestStatus(String requestId, String currentUserId, MatchRequestStatusCreateRequest requestDTO) {

        MatchRequest request = matchRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy yêu cầu ghép trận này!"));

        MatchPost post = matchPostRepository.findById(request.getPostId())
                .orElseThrow(() -> new AppException(404, "Không tìm thấy bài đăng!"));

        if (!post.getUserId().equals(currentUserId)) {
            throw new AppException(403, "Bạn không phải chủ bài đăng, không có quyền duyệt kèo này!");
        }

        // Lỗ hổng 3: Chặn duyệt lại yêu cầu đã xử lý
        if (request.getStatus() != Enums.RequestStatus.PENDING) {
            throw new AppException(400, "Yêu cầu này đã được xử lý trước đó!");
        }

        // Lỗ hổng 1: Chặn "bắt cá 2 tay", nếu bài đăng đã đóng thì không cho Accept nữa
        if (requestDTO.getStatus() == Enums.RequestStatus.ACCEPTED && post.getStatus() == Enums.PostStatus.CLOSED) {
            throw new AppException(400, "Bài đăng đã được chốt kèo với người khác!");
        }

        matchRequestMapper.updateEntityFromDto(requestDTO, request);
        MatchRequest savedRequest = matchRequestRepository.save(request);

        if (requestDTO.getStatus() == Enums.RequestStatus.ACCEPTED) {
            // Đóng bài đăng
            post.setStatus(Enums.PostStatus.CLOSED);
            matchPostRepository.save(post);

            User host = userRepository.findById(currentUserId).orElse(null);
            String hostName = host != null ? host.getFullName() : "Chủ bài đăng";
            String fieldCode = truncateId(post.getFieldId());

            // Thông báo cho người được nhận kèo
            NotificationCreateRequest notifReq = new NotificationCreateRequest();
            notifReq.setTitle("Kèo giao hữu đã được chốt!");
            notifReq.setContent("Tin vui! " + hostName + " đã CHỐT KÈO giao hữu với đội của bạn tại sân " + fieldCode + "!");
            notifReq.setType(Enums.NotificationType.MATCH_REQUEST);
            notificationService.createAndSendNotification(request.getRequesterId(), notifReq);

            // Lỗ hổng 2: TỰ ĐỘNG TỪ CHỐI (REJECT) các đối thủ khác đang chờ
            List<MatchRequest> otherRequests = matchRequestRepository.findByPostId(post.getId());
            for (MatchRequest other : otherRequests) {
                if (!other.getId().equals(requestId) && other.getStatus() == Enums.RequestStatus.PENDING) {
                    other.setStatus(Enums.RequestStatus.REJECTED);
                    matchRequestRepository.save(other);

                    // Bắn thông báo xin lỗi
                    NotificationCreateRequest rejectNotif = new NotificationCreateRequest();
                    rejectNotif.setTitle("Kèo giao hữu đã đóng");
                    rejectNotif.setContent("Rất tiếc, bài đăng tìm đối thủ tại sân " + fieldCode + " đã được chủ bài đăng chốt kèo với đội khác.");
                    rejectNotif.setType(Enums.NotificationType.MATCH_REQUEST);
                    notificationService.createAndSendNotification(other.getRequesterId(), rejectNotif);
                }
            }

        } else if (requestDTO.getStatus() == Enums.RequestStatus.REJECTED) {
            NotificationCreateRequest notifReq = new NotificationCreateRequest();
            notifReq.setTitle("Kèo giao hữu bị từ chối");
            notifReq.setContent("Rất tiếc, yêu cầu tham gia trận đấu của bạn đã bị chủ bài đăng từ chối.");
            notifReq.setType(Enums.NotificationType.MATCH_REQUEST);
            notificationService.createAndSendNotification(request.getRequesterId(), notifReq);
        }

        return matchRequestMapper.toStatusResponse(savedRequest);
    }
}