package com.example.backend.service;

import com.example.backend.dto.request.MessageCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {
     List<MessageResponse> getMessages(String conversationId, String currentUserId);
     MessageResponse createMessage(String conversationId, String currentUserId, MessageCreateRequest request);}
//MessageService