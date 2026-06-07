package com.example.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

import com.example.backend.utils.Enums;

@Data
public class ConversationResponse {
    private String id;
    private String partnerId; 
    private String partnerName; 
    private String lastMessage; 
    private LocalDateTime updatedAt; 
    private String name;
    private Enums.ConversationType type;
    private Enums.ConversationStatus status;
    private String matchId;
}