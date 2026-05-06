package com.example.backend.dto.request;

import com.example.backend.utils.Enums;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationCreateRequest {
    private String userId;
    private String title;
    private String content;
    private Enums.NotificationType type;
    private LocalDateTime createdAt;

}
//dto/request