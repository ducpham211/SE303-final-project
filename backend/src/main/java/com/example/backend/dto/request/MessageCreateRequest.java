package com.example.backend.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageCreateRequest {
    private String conversationId;
    private String senderId;
    private String content;
    private LocalDateTime createdAt;
}
//MessageCreateRequest