package com.example.backend.service;
import com.example.backend.dto.request.FairplayDecisionRequest;
import com.example.backend.dto.request.OpponentReviewCreateRequest;
import java.util.List;

public interface FairplayService {
    void submitReview(String reviewerId, OpponentReviewCreateRequest request);
    List<?> getPendingReviews();
    void resolveReview(String reviewId, FairplayDecisionRequest request);
    List<String> getMySubmittedMatchIds(String reviewerId);
}