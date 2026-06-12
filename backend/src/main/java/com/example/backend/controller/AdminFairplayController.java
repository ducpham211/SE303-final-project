package com.example.backend.controller;

import com.example.backend.dto.request.FairplayDecisionRequest;
import com.example.backend.entity.OpponentReview;
import com.example.backend.service.FairplayService;
import com.example.backend.utils.Enums;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/fairplay")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminFairplayController {
    private final FairplayService fairplayService;

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingReviews() {
        return ResponseEntity.ok(fairplayService.getPendingReviews());
    }

    @GetMapping("/reviews")
    public ResponseEntity<Page<OpponentReview>> getReviews(
            @RequestParam(required = false) Enums.FairplayStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(fairplayService.getReviews(status, page, size));
    }

    @PutMapping("/resolve/{id}")
    public ResponseEntity<String> resolveReview(
            @PathVariable("id") String reviewId,
            @RequestBody FairplayDecisionRequest request) {
        fairplayService.resolveReview(reviewId, request);
        return ResponseEntity.ok("Xử lý Tòa án Fairplay thành công!");
    }
}
