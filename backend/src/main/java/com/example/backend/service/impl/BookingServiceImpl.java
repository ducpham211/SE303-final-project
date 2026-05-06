package com.example.backend.service.impl;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.request.PaymentCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.AppException;
import com.example.backend.mapper.BookingMapper;
import com.example.backend.mapper.PaymentMapper;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.TimeSlotRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.BookingService;
import com.example.backend.service.NotificationService;
import com.example.backend.utils.Enums;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
    private final NotificationService notificationService;

    @Override
    @Transactional
    public BookingResponse createBooking(String userId, BookingCreateRequest request) {
        String timeSlotId = request.getTimeSlotId();
        String note = request.getNote();
        TimeSlot slot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy khung giờ này"));

        Enums.TimeSlotStatus currentStatus = slot.getStatus() != null ? slot.getStatus() : Enums.TimeSlotStatus.AVAILABLE;

        if (currentStatus != Enums.TimeSlotStatus.AVAILABLE) {
            throw new AppException(400, "Sân đã có người đặt hoặc đang chờ thanh toán");
        }

        String lockKey = "lock:booking:slot_" + timeSlotId;
        Boolean isLocked = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "LOCKED", 5, TimeUnit.MINUTES);

        if (Boolean.FALSE.equals(isLocked)) {
            throw new AppException(409, "Hệ thống đang xử lý giao dịch cho sân này. Vui lòng thử lại sau 5 phút.");
        }

        try {
            slot.setStatus(Enums.TimeSlotStatus.PENDING);
            timeSlotRepository.save(slot);
            
            Booking bookingSaved = bookingMapper.toEntity(request);
            bookingSaved.setUserId(userId);
            bookingSaved.setFieldId(slot.getFieldId());
            bookingSaved.setTotalAmount(slot.getPrice());
            bookingSaved.setStatus(Enums.BookingStatus.PENDING);
            if (bookingSaved.getTotalAmount() != null) {
                BigDecimal deposit = bookingSaved.getTotalAmount().multiply(BigDecimal.valueOf(0.3));
                bookingSaved.setDepositAmount(deposit);
            } else {
                bookingSaved.setDepositAmount(BigDecimal.ZERO);
            }
            bookingSaved.setBookingDate(slot.getStartTime().toLocalDate());
            bookingSaved.setUpdatedAt(LocalDateTime.now());
            bookingSaved.setCreatedAt(LocalDateTime.now());
            Booking savedBooking = bookingRepository.save(bookingSaved);
            NotificationCreateRequest notifRequest = new NotificationCreateRequest();
            notifRequest.setTitle("🎉 Đặt sân thành công (Chờ thanh toán)!");
            String content = String.format("Bạn vừa giữ chỗ thành công ca %s - %s. Vui lòng thanh toán cọc trong vòng 5 phút để chốt sân nhé!",
                    slot.getStartTime(),
                    slot.getEndTime());

            notifRequest.setContent(content);
            notifRequest.setType(Enums.NotificationType.BOOKING_UPDATE);

            notificationService.createAndSendNotification(userId, notifRequest);
            log.info("Khóa slot thành công trong 5 phút. Booking ID: {}", savedBooking.getId());
            return bookingMapper.toResponse(savedBooking, "Vui lòng thanh toán trong 5 phút!");

        } catch (Exception e) {
            redisTemplate.delete(lockKey);
            log.error("Lỗi khi tạo booking: ", e);
            throw new AppException(500, "Lỗi hệ thống khi tạo booking");
        }
    }
    
    @Transactional
    public void checkInBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đơn đặt sân"));

        if (booking.getStatus() != Enums.BookingStatus.DEPOSIT_PAID) {
            throw new AppException(400, "Trạng thái đơn không hợp lệ để Check-in. Đơn phải ở trạng thái ĐÃ CỌC.");
        }

        booking.setStatus(Enums.BookingStatus.COMPLETED);
        bookingRepository.save(booking);
        log.info("==== CHỦ SÂN ==== Đã Check-in cho đơn: {}", bookingId);
    }

    @Transactional
    public String checkOutBooking(String bookingId, Enums.PaymentMethod method) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đơn đặt sân"));

        if (booking.getStatus() == Enums.BookingStatus.COMPLETED) {
            throw new AppException(400, "Đơn này đã được thanh toán và hoàn tất trước đó rồi!");
        }

        long totalAmount = booking.getTotalAmount().longValue();
        long depositAmount = booking.getDepositAmount() != null ? booking.getDepositAmount().longValue() : 0;
        long remainingAmount = totalAmount - depositAmount;

        booking.setStatus(Enums.BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        if(remainingAmount > 0){
            PaymentCreateRequest paymentRequest = new PaymentCreateRequest();
            paymentRequest.setAmount(BigDecimal.valueOf(remainingAmount));
            paymentRequest.setPaymentMethod(method);

            Payment restOfAmount = paymentMapper.createPaymentEntity(paymentRequest);
            restOfAmount.setBookingId(booking.getId());
            restOfAmount.setCreatedAt(LocalDateTime.now());

            paymentRepository.save(restOfAmount);

            log.info("==== KẾ TOÁN ==== Đã thu thêm {} VND qua hình thức {} cho đơn {}", remainingAmount, method, bookingId);
        }

        log.info("==== CHỦ SÂN ==== Đã Check-out đơn: {}. Thu thêm: {} VND", bookingId, remainingAmount);

        return "Check-out thành công. Khách cần thanh toán thêm: " + remainingAmount + " VND";
    }

    @Transactional
    public void markAsNoShow(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đơn"));

        if (booking.getStatus() != Enums.BookingStatus.DEPOSIT_PAID) {
            throw new AppException(400, "Chỉ có thể đánh dấu bùng kèo với đơn đã cọc.");
        }

        booking.setStatus(Enums.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        TimeSlot slot = timeSlotRepository.findById(booking.getTimeSlotId()).orElse(null);
        if (slot != null) {
            slot.setStatus(Enums.TimeSlotStatus.AVAILABLE);
            timeSlotRepository.save(slot);
        }

        log.info("==== CHỦ SÂN ==== Khách bùng kèo đơn {}. Đã tịch thu cọc và nhả sân!", bookingId);
    }
    
    @Transactional (readOnly = true)
    public List<BookingResponse> getBookings(String userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(404, "Không tìm thấy user"));
        List<Booking> result =  bookingRepository.findByUserId(userId);
        return result.stream().map(booking -> {
            BookingResponse response = bookingMapper.toResponse(booking, null);
            timeSlotRepository.findById(booking.getTimeSlotId()).ifPresent(slot -> {
                response.setStartTime(slot.getStartTime() != null ? slot.getStartTime().toString() : null);
                response.setEndTime(slot.getEndTime() != null ? slot.getEndTime().toString() : null);
            });
            return response;
        }).toList();
    }

    @Override
    @Transactional
    public void completeBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đơn đặt sân"));

        if (booking.getStatus() != Enums.BookingStatus.DEPOSIT_PAID) {
            throw new AppException(400, "Đơn đặt sân chưa đặt cọc hoặc đã được xử lý!");
        }

        booking.setStatus(Enums.BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        long totalAmount = booking.getTotalAmount() != null ? booking.getTotalAmount().longValue() : 0;
        long depositAmount = booking.getDepositAmount() != null ? booking.getDepositAmount().longValue() : 0;
        long remainingAmount = totalAmount - depositAmount;

        if (remainingAmount > 0) {
            try {
                PaymentCreateRequest paymentRequest = new PaymentCreateRequest();
                paymentRequest.setAmount(BigDecimal.valueOf(remainingAmount));
                
                Payment restOfAmount = paymentMapper.createPaymentEntity(paymentRequest);
                restOfAmount.setBookingId(booking.getId());
                restOfAmount.setUserId(booking.getUserId());
                restOfAmount.setStatus(Enums.PaymentStatus.SUCCESS);
                restOfAmount.setCreatedAt(LocalDateTime.now());
                paymentRepository.save(restOfAmount);
                log.info("==== KẾ TOÁN ==== Đã thu thêm tiền ngoài {} VND cho đơn {}", remainingAmount, bookingId);
            } catch (Exception e) {
                log.error("Lỗi khi lưu lịch sử thu tiền: ", e);
            }
        }

        try {
            NotificationCreateRequest notif = new NotificationCreateRequest();
            notif.setTitle("✅ Ca đá đã hoàn tất!");
            String shortId = bookingId.length() >= 6 ? bookingId.substring(0, 6).toUpperCase() : bookingId;
            notif.setContent("Chủ sân đã xác nhận thu đủ tiền và hoàn tất ca đá mã " + shortId + " của bạn. Cảm ơn bạn!");
            notif.setType(Enums.NotificationType.SYSTEM);
            notificationService.createAndSendNotification(booking.getUserId(), notif);
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo hoàn tất đơn: ", e);
        }
    }
}