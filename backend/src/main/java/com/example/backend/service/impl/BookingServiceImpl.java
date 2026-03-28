// File 6: service/impl/BookingServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Enums;
import com.example.backend.entity.TimeSlot;
import com.example.backend.exception.AppException; // Xài lại cục Exception xịn của bác
import com.example.backend.mapper.BookingMapper;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.TimeSlotRepository;
import com.example.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final StringRedisTemplate redisTemplate;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    @Override
    @Transactional
    public BookingResponse createBooking(String userId, BookingCreateRequest request) {
        String timeSlotId = request.getTimeSlotId();
        String note = request.getNote();
        // 1. Kiểm tra Slot có tồn tại và đang AVAILABLE không
        TimeSlot slot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy khung giờ này"));

        if (!slot.getStatus().equals(Enums.TimeSlotStatus.AVAILABLE)) {
            throw new AppException(400, "Sân đã có người đặt hoặc đang chờ thanh toán");
        }

        // 2. Tung chiêu Redis Lock (Giữ 30 giây để test)
        String lockKey = "lock:booking:slot_" + timeSlotId;
        Boolean isLocked = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "LOCKED", 5, TimeUnit.MINUTES);

        if (Boolean.FALSE.equals(isLocked)) {
            throw new AppException(409, "Hệ thống đang xử lý giao dịch cho sân này. Vui lòng thử lại sau 5 phút.");
        }

        try {
            // 3. Đổi trạng thái sân sang PENDING
            slot.setStatus(Enums.TimeSlotStatus.PENDING);
            timeSlotRepository.save(slot);

            // 4. Tạo hóa đơn Booking
            Booking booking = new Booking();
            booking.setId(UUID.randomUUID().toString());
            booking.setUserId(userId);
            booking.setTimeSlotId(timeSlotId);
            booking.setFieldId(slot.getFieldId()); // Lấy từ TimeSlot sang
            booking.setStatus(Enums.BookingStatus.PENDING);
            booking.setTotalAmount(slot.getPrice());
            booking.setCreatedAt(LocalDateTime.now());
            booking.setUpdatedAt(LocalDateTime.now());
            booking.setBookingDate(LocalDateTime.now().toLocalDate());
            booking.setNote(note);
            Booking savedBooking = bookingRepository.save(booking);

            log.info("Khóa slot thành công trong 5 phút. Booking ID: {}", savedBooking.getId());
            return bookingMapper.toResponse(savedBooking, "Vui lòng thanh toán trong 5 phút!");

        } catch (Exception e) {
            // Nếu có lỗi thì phải tự tay tháo ổ khóa ra
            redisTemplate.delete(lockKey);
            log.error("Lỗi khi tạo booking: ", e);
            throw new AppException(500, "Lỗi hệ thống khi tạo booking");
        }
    }
}