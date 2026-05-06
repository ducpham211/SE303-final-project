package com.example.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConversationResponse {
    private String id;
    private String partnerId; 
    private String partnerName; 
    private String lastMessage; 
    private LocalDateTime updatedAt; 
}