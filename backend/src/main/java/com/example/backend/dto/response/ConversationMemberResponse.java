package com.example.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConversationMemberResponse {
    private String conversationId;
    private String userId;
    private LocalDateTime joinedAt;
}
