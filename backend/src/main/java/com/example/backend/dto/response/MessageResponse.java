package com.example.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageResponse {
    private String id;
    private String conversationId;
    private String senderId;
    private String content;
    private LocalDateTime createdAt;
}
//MessageResponse