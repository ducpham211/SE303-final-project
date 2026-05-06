package com.example.backend.dto.aiChatBot.request;

import lombok.Data;

@Data
public class ChatCreateRequest {
    private String message;
    private String sessionId;
}