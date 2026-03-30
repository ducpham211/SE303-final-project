package com.example.backend.service;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.entity.MatchRequest;

public interface MatchRequestService {
    MatchRequestResponse createMatchRequest(MatchRequestCreateRequest request);
}
