package com.example.backend.dto.response;

import com.example.backend.utils.Enums.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class NotificationResponse {
    private String id;
    private String title;
    private String content;
    private NotificationType type;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
//dto/response