package com.example.backend.service.impl;

import com.example.backend.dto.request.FairplayDecisionRequest;
import com.example.backend.dto.request.OpponentReviewCreateRequest;
import com.example.backend.entity.OpponentReview;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.repository.OpponentReviewRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.FairplayService;
import com.example.backend.utils.Enums;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.service.NotificationService;

@Service
@RequiredArgsConstructor
public class FairplayServiceImpl implements FairplayService {

    private final OpponentReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public void submitReview(String reviewerId, OpponentReviewCreateRequest request) {
        if (reviewerId.equals(request.getRevieweeId())) {
            throw new AppException(400, "Bạn không thể tự đánh giá chính mình!");
        }

        // CHẶN GỬI 2 LẦN
        if (reviewRepository.existsByMatchIdAndReviewerId(request.getMatchId(), reviewerId)) {
            throw new AppException(400, "Bạn đã gửi đánh giá đối thủ cho trận đấu này rồi!");
        }

        OpponentReview review = new OpponentReview();
        review.setMatchId(request.getMatchId());
        review.setReviewerId(reviewerId);
        review.setRevieweeId(request.getRevieweeId());
        review.setRatingType(request.getRatingType());
        review.setComment(request.getComment());
        review.setStatus(Enums.FairplayStatus.PENDING);
        review.setCreatedAt(LocalDateTime.now());
        review.setImageUrl(request.getImageUrl());
        
        reviewRepository.save(review);
    }

    @Override
    public List<?> getPendingReviews() {
        return reviewRepository.findByStatusOrderByCreatedAtDesc(Enums.FairplayStatus.PENDING);
    }

    @Override
    @Transactional
    public void resolveReview(String reviewId, FairplayDecisionRequest request) {
        OpponentReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy báo cáo"));

        if (review.getStatus() != Enums.FairplayStatus.PENDING) {
            throw new AppException(400, "Đánh giá này đã được xử lý");
        }

        if (request.isAccepted()) {
            review.setStatus(Enums.FairplayStatus.RESOLVED);
            review.setPointsApplied(request.getPointsApplied());

            User reviewee = userRepository.findById(review.getRevieweeId())
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));

            int currentScore = reviewee.getTrustScore() != null ? reviewee.getTrustScore() : 100;
            reviewee.setTrustScore(currentScore + request.getPointsApplied());
            userRepository.save(reviewee);

            // Gửi thông báo cho người chơi bị tố cáo về phán quyết của tòa án
            try {
                NotificationCreateRequest notifRequest = new NotificationCreateRequest();
                notifRequest.setTitle("Phán quyết từ Tòa án Fairplay");
                
                String changeText = request.getPointsApplied() >= 0 
                    ? ("được cộng " + request.getPointsApplied() + " điểm")
                    : ("bị trừ " + Math.abs(request.getPointsApplied()) + " điểm");
                    
                String reasonText = "";
                if (review.getRatingType() == Enums.OpponentRatingType.NO_SHOW) {
                    reasonText = " do bùng kèo/hủy phút chót";
                } else if (review.getRatingType() == Enums.OpponentRatingType.BAD_BEHAVIOR) {
                    reasonText = " do hành vi chơi bạo lực/gây rối";
                } else if (review.getRatingType() == Enums.OpponentRatingType.GOOD) {
                    reasonText = " vì thi đấu đẹp/thân thiện";
                }
                
                notifRequest.setContent("Theo phán quyết của Tòa án Fairplay, bạn " + changeText + " uy tín" + reasonText + ". Điểm uy tín hiện tại của bạn là: " + reviewee.getTrustScore() + "đ.");
                notifRequest.setType(Enums.NotificationType.SYSTEM);
                notificationService.createAndSendNotification(reviewee.getId(), notifRequest);
            } catch (Exception e) {
                System.err.println("Lỗi gửi thông báo phán quyết Fairplay: " + e.getMessage());
            }
        } else {
            review.setStatus(Enums.FairplayStatus.REJECTED);
        }

        reviewRepository.save(review);
    }

    // LẤY DANH SÁCH MATCH ĐÃ GỬI
    @Override
    public List<String> getMySubmittedMatchIds(String reviewerId) {
        return reviewRepository.findMatchIdsByReviewerId(reviewerId);
    }
}