package com.example.backend.controller;

import com.example.backend.dto.request.MessageCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MessageResponse;
import com.example.backend.service.ConversationService;
import com.example.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final MessageService messageService;
    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getInbox() {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(conversationService.getInbox(currentUserId));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable("id") String conversationId) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(messageService.getMessages(conversationId, currentUserId));
    }
    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageResponse> createMessage(
            @PathVariable("id") String conversationId,
            @RequestBody MessageCreateRequest request
    ) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Ném cả conversationId (từ URL) và currentUserId (từ Token) xuống cho Service xử lý
        MessageResponse response = messageService.createMessage(conversationId, currentUserId, request);
        return ResponseEntity.ok(response);
    }
}