package com.example.backend.dto.request;

import lombok.Data;

@Data
public class MatchRequestCreateRequest {
    private String postId;
    private String requesterId;
    private String message;
}
