package com.example.backend.controller;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.response.NotificationResponse;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.utils.TokenUtils;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        String userId = TokenUtils.getCurrentUserId();
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String userId = TokenUtils.getCurrentUserId();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable String id) {
        String userId = TokenUtils.getCurrentUserId();
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        String userId = TokenUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/test-send")
    public ResponseEntity<String> testSendNotification(@RequestBody NotificationCreateRequest request) {
        String userId = TokenUtils.getCurrentUserId();
        notificationService.createAndSendNotification(userId, request);
        return ResponseEntity.ok("Notification sent successfully to user: " + userId);
    }
}