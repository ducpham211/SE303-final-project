package com.example.backend.service.impl;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.entity.Enums;
import com.example.backend.entity.MatchPost;
import com.example.backend.entity.MatchRequest;
import com.example.backend.mapper.MatchRequestMapper;
import com.example.backend.repository.MatchPostRepository;
import com.example.backend.repository.MatchRequestRepository;
import com.example.backend.service.ConversationService;
import com.example.backend.service.MatchRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class MatchRequestServiceImpl implements MatchRequestService {
    private final MatchRequestRepository matchRequestRepository;
    private final MatchRequestMapper matchRequestMapper;
    private final MatchPostRepository matchPostRepository;
    private final ConversationService conversationService;    public MatchRequestServiceImpl(MatchRequestRepository matchRequestRepository, MatchRequestMapper matchRequestMapper, MatchPostRepository matchPostRepository, ConversationService conversationService) {
        this.matchRequestRepository = matchRequestRepository;
        this.matchRequestMapper = matchRequestMapper;
        this.matchPostRepository = matchPostRepository;
        this.conversationService = conversationService;
    }

    @Override
    public MatchRequestResponse createMatchRequest(MatchRequestCreateRequest request) {
        boolean isAlreadyRequested = matchRequestRepository.existsByPostIdAndRequesterId(
                request.getPostId(),
                request.getRequesterId()
        );

        if (isAlreadyRequested) {
            throw new RuntimeException("Bạn đã gửi yêu cầu nhận kèo cho bài này rồi!");
        }
        MatchRequest matchRequest = matchRequestMapper.toEntity(request);
        matchRequest.setStatus(Enums.RequestStatus.PENDING);
        MatchRequest savedMatchRequest = matchRequestRepository.save(matchRequest);
        return matchRequestMapper.toResponse(savedMatchRequest);
    }
    @Override
    @Transactional
    public MatchRequestStatusResponse updateRequestStatus(String requestId, String currentUserId, MatchRequestStatusCreateRequest requestDTO) {

        MatchRequest request = matchRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu ghép trận này!"));

        MatchPost post = matchPostRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));

        if (!post.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không phải chủ bài đăng, không có quyền duyệt kèo này!");
        }

        // 1. Dùng Mapper để update trạng thái từ DTO vào Entity
        matchRequestMapper.updateEntityFromDto(requestDTO, request);
        MatchRequest savedRequest = matchRequestRepository.save(request);

        String newConversationId = null;

        // 2. Xử lý Side Effect nếu CHẤP NHẬN
        if (requestDTO.getStatus() == Enums.RequestStatus.ACCEPTED) {

            // Đóng bài đăng
            post.setStatus(Enums.PostStatus.CLOSED);
            matchPostRepository.save(post);

            //  KHỞI TẠO REQUEST DTO CHO CONVERSATION
            ConversationCreateRequest chatRequest = new ConversationCreateRequest();
            chatRequest.setType(Enums.ConversationType.DIRECT);
            chatRequest.setCreatedAt(LocalDateTime.now());

            //  GỌI SERVICE BẰNG DTO VÀ HỨNG RESPONSE DTO
            ConversationResponse chatResponse = conversationService.createDirectConversation(
                    chatRequest,
                    post.getUserId(),
                    request.getRequesterId()
            );

            // Lấy ID từ Response
            newConversationId = chatResponse.getId();

            // (Tùy chọn) Bác có thể gọi hàm từ chối tất cả các request khác ở đây
        }

        // 3. Dùng Mapper biến Entity thành Response DTO
        MatchRequestStatusResponse response = matchRequestMapper.toStatusResponse(savedRequest);
        response.setConversationId(newConversationId);

        return response;
    }
}
