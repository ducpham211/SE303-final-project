package com.example.backend.entity.redis;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
// Thuộc tính timeToLive = 3600 thiết lập thời gian tồn tại của phiên là 1 giờ (3600 giây)
@RedisHash(value = "ChatSession", timeToLive = 3600)
public class ChatSession {

    @Id
    private String sessionId;

    private List<MessageNode> messages = new ArrayList<>();

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MessageNode {
        private String role; // system, user, hoặc assistant
        private String content;
    }
}