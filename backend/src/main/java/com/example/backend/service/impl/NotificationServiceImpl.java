package com.example.backend.service.impl;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.response.NotificationResponse;
import com.example.backend.entity.Notification;
import com.example.backend.exception.AppException;
import com.example.backend.mapper.NotificationMapper;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Clean code
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final StringRedisTemplate redisTemplate;
    private static final String UNREAD_PREFIX = "unread_count:";

    @Override
    public List<NotificationResponse> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponse markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(404, "Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new AppException(403, "You do not have permission to modify this notification");
        }

        notification.setIsRead(true);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void createAndSendNotification(String userId, NotificationCreateRequest request) {
        // 1. Chuyển đổi và setup các giá trị mặc định an toàn
        Notification notification = notificationMapper.toEntity(request);
        notification.setUserId(userId); // Fix cứng gửi cho user nào
        notification.setCreatedAt(LocalDateTime.now());
        notification.setIsRead(false);  // Thông báo mới luôn chưa đọc

        // 2. Lưu DB
        Notification savedNotification = notificationRepository.save(notification);
        NotificationResponse response = notificationMapper.toResponse(savedNotification);

        // 3. Bắn WebSocket xuống client
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", response);
    }
    @Override
    public void incrementUnreadCount(String userId, String roomId) {
        String key = UNREAD_PREFIX + userId + ":" + roomId;
        redisTemplate.opsForValue().increment(key);
    }

    @Override
    public void resetUnreadCount(String userId, String roomId) {
        String key = UNREAD_PREFIX + userId + ":" + roomId;
        redisTemplate.delete(key);
    }

    @Override
    public int getUnreadCount(String userId, String roomId) {
        String key = UNREAD_PREFIX + userId + ":" + roomId;
        String count = redisTemplate.opsForValue().get(key);
        return count != null ? Integer.parseInt(count) : 0;
    }
}