// service/impl/ReviewServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.dto.request.ReviewCreateRequest;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.Review;
import com.example.backend.mapper.ReviewMapper;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.service.ReviewService;
import com.example.backend.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import com.example.backend.service.ai.GroqAiService; // Import service mới
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    // 👉Tiêm GroqAiService vào đây
    private final GroqAiService groqAiService;

    @Override
    @Transactional
    public ReviewResponse createReview(String reviewerId, ReviewCreateRequest request) {
        if (reviewRepository.existsByMatchRequestIdAndReviewerId(request.getMatchRequestId(), reviewerId)) {
            // Ném lỗi 400 Bad Request để Frontend hiển thị chữ đỏ cho khách
            throw new AppException(400, "Bạn đã đánh giá trận đấu này rồi, không thể đánh giá lại!");
            // Nếu bạn có custom AppException thì dùng: throw new AppException(400, "Bạn đã...");
        }
        Review review = reviewMapper.toEntity(request);
        review.setReviewerId(reviewerId);
        review.setCreatedAt(LocalDateTime.now());
        review.setScoreChange(0);

        //  GỌI GROQ AI Ở ĐÂY
        GroqAiService.AiAnalysisResult aiResult = groqAiService.analyzeReview(request.getReason());

        log.info("==== GROQ AI REVIEW ==== Toxic: {}, Penalty: {}", aiResult.isToxic(), aiResult.penaltyScore());

        // Logic check điểm và lưu DB như cũ...
        if (aiResult.isToxic()) {
            review.setAiSuggestedPenalty(aiResult.penaltyScore());
            review.setStatus(Enums.ReviewStatus.PENDING_ADMIN_REVIEW);
        } else {
            review.setAiSuggestedPenalty(0);
            review.setStatus(Enums.ReviewStatus.AUTO_PASSED);
        }

        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toResponse(savedReview);
    }
}