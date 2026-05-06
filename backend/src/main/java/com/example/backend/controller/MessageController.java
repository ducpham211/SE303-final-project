package com.example.backend.controller;

import com.example.backend.dto.request.MessageCreateRequest;
import com.example.backend.dto.response.MessageResponse;
import com.example.backend.service.MessageService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@AllArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> createMessage(
            @RequestBody MessageCreateRequest request,
            Authentication authentication) {

        String currentUserId = authentication.getName();

        MessageResponse response = messageService.createMessage(
                request.getConversationId(),
                currentUserId,
                request);

        return ResponseEntity.ok(response);
    }

}