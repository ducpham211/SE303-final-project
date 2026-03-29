// File 6: service/impl/BookingServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException; // Xài lại cục Exception xịn của bác
import com.example.backend.mapper.BookingMapper;
import com.example.backend.mapper.PaymentMapper;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.TimeSlotRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentRepository paymentRepository;

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
    @Transactional
    public void checkInBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));

        // Chỉ cho phép check-in nếu khách đã cọc tiền
        if (booking.getStatus() != Enums.BookingStatus.DEPOSIT_PAID) {
            throw new RuntimeException("Trạng thái đơn không hợp lệ để Check-in. Đơn phải ở trạng thái ĐÃ CỌC.");
        }

        booking.setStatus(Enums.BookingStatus.COMPLETED);
        bookingRepository.save(booking);
        log.info("==== CHỦ SÂN ==== Đã Check-in cho đơn: {}", bookingId);
    }

    @Transactional
    public String checkOutBooking(String bookingId, Enums.PaymentMethod method) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân"));

        // Chỉ cho phép check-out nếu khách đang đá (đã check-in) hoặc ít nhất là đã cọc
        if (booking.getStatus() == Enums.BookingStatus.COMPLETED) {
            throw new RuntimeException("Đơn này đã được thanh toán và hoàn tất trước đó rồi!");
        }

        // Tính tiền thu thêm (Tổng - Cọc)
        long totalAmount = booking.getTotalAmount().longValue();
        long depositAmount = booking.getDepositAmount() != null ? booking.getDepositAmount().longValue() : 0;
        long remainingAmount = totalAmount - depositAmount;

        // Cập nhật trạng thái hoàn tất
        booking.setStatus(Enums.BookingStatus.COMPLETED);
        bookingRepository.save(booking);
        if(remainingAmount > 0){
            Payment restOfAmount = paymentMapper.createPaymentEntity(
                    booking,
                    BigDecimal.valueOf(remainingAmount),
                    method,
                    null
            );
            paymentRepository.save(restOfAmount);
            log.info("==== KẾ TOÁN ==== Đã thu thêm {} VND qua hình thức {} cho đơn {}",
                    remainingAmount, method, bookingId);
        }
        // (Tùy chọn) Bác có thể cập nhật trạng thái của TimeSlot về lại AVAILABLE hoặc để nguyên tùy logic lưu lịch sử của bác.

        log.info("==== CHỦ SÂN ==== Đã Check-out đơn: {}. Thu thêm: {} VND", bookingId, remainingAmount);

        return "Check-out thành công. Khách cần thanh toán thêm: " + remainingAmount + " VND";
    }
    @Transactional
    public void markAsNoShow(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn"));

        if (booking.getStatus() != Enums.BookingStatus.DEPOSIT_PAID) {
            throw new RuntimeException("Chỉ có thể đánh dấu bùng kèo với đơn đã cọc.");
        }

        // Đổi trạng thái thành Bùng kèo (Tịch thu cọc)
        booking.setStatus(Enums.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Nhả sân ra cho người khác thuê (vớt vát được đồng nào hay đồng đó)
        TimeSlot slot = timeSlotRepository.findById(booking.getTimeSlotId()).orElse(null);
        if (slot != null) {
            slot.setStatus(Enums.TimeSlotStatus.AVAILABLE);
            timeSlotRepository.save(slot);
        }

        log.info("==== CHỦ SÂN ==== Khách bùng kèo đơn {}. Đã tịch thu cọc và nhả sân!", bookingId);
    }
    @Transactional (readOnly = true)
    public List<BookingResponse> getBookings(String userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        List<Booking> result =  bookingRepository.findByUserId(userId);
        return result.stream().map(booking->bookingMapper.toResponse(booking, null)).toList();
    }
}