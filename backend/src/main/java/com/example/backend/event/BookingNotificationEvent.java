package com.example.backend.event;

import com.example.backend.utils.Enums;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BookingNotificationEvent {
    private final String userId;
    private final String title;
    private final String content;
    private final Enums.NotificationType type;
}
