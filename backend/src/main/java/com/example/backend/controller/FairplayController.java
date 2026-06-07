package com.example.backend.controller;

import com.example.backend.dto.request.OpponentReviewCreateRequest;
import com.example.backend.service.FairplayService;
import com.example.backend.utils.TokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fairplay")
@RequiredArgsConstructor
public class FairplayController {
    private final FairplayService fairplayService;

    @PostMapping("/reviews")
    public ResponseEntity<String> submitReview(@RequestBody OpponentReviewCreateRequest request) {
        String reviewerId = TokenUtils.getCurrentUserId();
        fairplayService.submitReview(reviewerId, request);
        return ResponseEntity.ok("Đã gửi đánh giá lên Tòa án Fairplay chờ xử lý!");
    }

    @GetMapping("/my-submitted")
    public ResponseEntity<List<String>> getMySubmittedReviews() {
        String reviewerId = TokenUtils.getCurrentUserId();
        return ResponseEntity.ok(fairplayService.getMySubmittedMatchIds(reviewerId));
    }
}