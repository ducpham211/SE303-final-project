package com.example.backend.controller;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.service.MatchRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
