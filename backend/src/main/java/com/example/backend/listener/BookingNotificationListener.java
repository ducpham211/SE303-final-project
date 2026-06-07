package com.example.backend.listener;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.event.BookingNotificationEvent;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingNotificationListener {

    private final NotificationService notificationService;

    @EventListener
    public void handleBookingNotificationEvent(BookingNotificationEvent event) {
        try {
            NotificationCreateRequest request = new NotificationCreateRequest();
            request.setTitle(event.getTitle());
            request.setContent(event.getContent());
            request.setType(event.getType());
            notificationService.createAndSendNotification(event.getUserId(), request);
            log.info("Đã gửi thông báo ngầm cho user: {}", event.getUserId());
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo: ", e);
        }
    }
}
