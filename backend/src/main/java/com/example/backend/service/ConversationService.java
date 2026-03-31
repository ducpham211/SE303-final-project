package com.example.backend.service;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.response.ConversationResponse;

public interface ConversationService {
    ConversationResponse createDirectConversation(ConversationCreateRequest request, String user1Id, String user2Id);
}