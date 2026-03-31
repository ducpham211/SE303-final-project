package com.example.backend.dto.request;

import com.example.backend.entity.Enums;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConversationCreateRequest {
    private Enums.ConversationType type;
    private LocalDateTime createdAt; // Sửa lại thành camelCase
}