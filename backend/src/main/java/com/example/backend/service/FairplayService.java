package com.example.backend.service;
import com.example.backend.dto.request.FairplayDecisionRequest;
import com.example.backend.dto.request.OpponentReviewCreateRequest;
import com.example.backend.entity.OpponentReview;
import com.example.backend.utils.Enums;
import org.springframework.data.domain.Page;
import java.util.List;

public interface FairplayService {
    void submitReview(String reviewerId, OpponentReviewCreateRequest request);
    List<?> getPendingReviews();
    Page<OpponentReview> getReviews(Enums.FairplayStatus status, int page, int size);
    void resolveReview(String reviewId, FairplayDecisionRequest request);
    List<String> getMySubmittedMatchIds(String reviewerId);
}
