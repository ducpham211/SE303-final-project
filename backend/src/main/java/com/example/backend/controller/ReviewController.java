// controller/ReviewController.java
package com.example.backend.controller;

import com.example.backend.dto.request.ReviewCreateRequest;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.service.ReviewService;
import com.example.backend.utils.TokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@RequestBody ReviewCreateRequest request) {
        String reviewerId = TokenUtils.getCurrentUserId();
        User user = userRepository.findById(reviewerId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));
        ReviewResponse response = reviewService.createReview(reviewerId, request);
        return ResponseEntity.ok(response);
    }
}