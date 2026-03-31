package com.example.backend.controller;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.service.MatchRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/match-requests")
@RequiredArgsConstructor

public class MatchRequestController {
    private final MatchRequestService matchRequestService;
    @PostMapping
    public ResponseEntity<MatchRequestResponse> createMatchRequest(@RequestBody MatchRequestCreateRequest request){
        MatchRequestResponse response = matchRequestService.createMatchRequest(request);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{req_id}/status")
    public ResponseEntity<MatchRequestStatusResponse> updateRequestStatus(
            @PathVariable("req_id") String requestId,
            @RequestBody MatchRequestStatusCreateRequest status
    ) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        MatchRequestStatusResponse response = matchRequestService.updateRequestStatus(requestId, currentUserId, status);
        return ResponseEntity.ok(response);
    }
}