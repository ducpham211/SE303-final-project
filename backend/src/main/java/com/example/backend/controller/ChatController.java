package com.example.backend.controller;

import com.example.backend.dto.aiChatBot.request.ChatCreateRequest;
import com.example.backend.dto.aiChatBot.response.ChatResponse;
import com.example.backend.service.ai.GroqAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final GroqAiService groqAiService;

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askChatbot(@RequestBody ChatCreateRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Nội dung tin nhắn không hợp lệ.", null));
        }

        ChatResponse response = groqAiService.askChatbot(request);
        return ResponseEntity.ok(response);
    }
}