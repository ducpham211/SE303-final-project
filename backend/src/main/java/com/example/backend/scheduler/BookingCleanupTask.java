package com.example.backend.scheduler;

import com.example.backend.entity.Booking;
import com.example.backend.utils.Enums;
import com.example.backend.entity.TimeSlot;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingCleanupTask {

    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;

    // Chạy ngầm định kỳ mỗi 10 giây (10000 ms) một lần
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void releaseExpiredPendingBookings() {
        // Mốc thời gian giới hạn: Hiện tại lùi lại 30 giây
        LocalDateTime deadline = LocalDateTime.now().minusMinutes(5);

        // Tìm các Booking đang PENDING và được tạo trước mốc 30s
        List<Booking> expiredBookings = bookingRepository
                .findByStatusAndCreatedAtBefore(Enums.BookingStatus.PENDING, deadline);

        if (!expiredBookings.isEmpty()) {
            log.info("==== CRON-JOB ==== Phát hiện {} booking quá 5 phút chưa thanh toán. Đang dọn dẹp...", expiredBookings.size());

            for (Booking booking : expiredBookings) {
                // 1. Đổi Booking thành Đã Hủy
                booking.setStatus(Enums.BookingStatus.CANCELLED);
                booking.setUpdatedAt(LocalDateTime.now());

                // 2. Tìm cái Slot bị kẹt và mở khóa nó về AVAILABLE
                TimeSlot slot = timeSlotRepository.findById(booking.getTimeSlotId()).orElse(null);
                if (slot != null) {
                    slot.setStatus(Enums.TimeSlotStatus.AVAILABLE);
                    timeSlotRepository.save(slot);
                }
            }
            // Lưu lại đống booking đã hủy xuống DB
            bookingRepository.saveAll(expiredBookings);
            log.info("==== CRON-JOB ==== Đã nhả slot về AVAILABLE thành công!");
        }
    }
}