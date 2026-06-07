package com.example.backend.service;

import com.example.backend.dto.request.ReviewCreateRequest;
import com.example.backend.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(String userId, ReviewCreateRequest request);
    
    List<ReviewResponse> getReviewsByFieldId(String fieldId);
    
    List<ReviewResponse> getMyReviews(String userId);
}