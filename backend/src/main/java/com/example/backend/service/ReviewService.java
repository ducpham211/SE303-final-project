// service/ReviewService.java
package com.example.backend.service;

import com.example.backend.dto.request.ReviewCreateRequest;
import com.example.backend.dto.response.ReviewResponse;

public interface ReviewService {
    ReviewResponse createReview(String reviewerId, ReviewCreateRequest request);
}