package com.example.backend.service;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.response.ConversationResponse;

import java.util.List;

public interface ConversationService {
    ConversationResponse createDirectConversation(ConversationCreateRequest request, String user1Id, String user2Id);
    List<ConversationResponse> getInbox(String currentUserId);
}