package com.example.backend.service;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.response.NotificationResponse;
import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotificationsByUserId(String userId);
    NotificationResponse markAsRead(String notificationId, String userId);
    void markAllAsRead(String userId);
    long getUnreadCount(String userId);
    // Đảm bảo chữ ký này đồng nhất với Impl
    void createAndSendNotification(String userId, NotificationCreateRequest request);
    void incrementUnreadCount(String userId, String roomId);
    void resetUnreadCount(String userId, String roomId);
    int getUnreadCount(String userId, String roomId);

}