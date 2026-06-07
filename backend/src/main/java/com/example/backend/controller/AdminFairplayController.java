package com.example.backend.controller;

import com.example.backend.dto.request.FairplayDecisionRequest;
import com.example.backend.service.FairplayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/fairplay")
@RequiredArgsConstructor
public class AdminFairplayController {
    private final FairplayService fairplayService;

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingReviews() {
        return ResponseEntity.ok(fairplayService.getPendingReviews());
    }

    @PutMapping("/resolve/{id}")
    public ResponseEntity<String> resolveReview(
            @PathVariable("id") String reviewId,
            @RequestBody FairplayDecisionRequest request) {
        fairplayService.resolveReview(reviewId, request);
        return ResponseEntity.ok("Xử lý Tòa án Fairplay thành công!");
    }
}