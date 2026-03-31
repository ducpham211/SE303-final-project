package com.example.backend.dto.response;

import com.example.backend.entity.Enums;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConversationResponse {
    private String id;
    private Enums.ConversationType type;
    private LocalDateTime createdAt;
}