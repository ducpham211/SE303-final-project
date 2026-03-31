package com.example.backend.dto.request;

import lombok.Data;

@Data
public class ConversationMemberCreateRequest {
    private String conversationId;
    private String userId;

}
