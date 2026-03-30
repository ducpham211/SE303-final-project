package com.example.backend.dto.response;

import com.example.backend.entity.Enums;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MatchRequestResponse {
    private String id;
    private String postId;
    private String requesterId;
    private String message;
    private Enums.RequestStatus status;
    private LocalDateTime createdAt;
}