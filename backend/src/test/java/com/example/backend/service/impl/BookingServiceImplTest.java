package com.example.backend.service.impl;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.TimeSlot;
import com.example.backend.exception.AppException;
import com.example.backend.mapper.BookingMapper;
import com.example.backend.mapper.PaymentMapper;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.TimeSlotRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import com.example.backend.event.BookingNotificationEvent;
import com.example.backend.utils.Enums;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingMapper bookingMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private final String userId = "user123";
    private final String timeSlotId = "slot123";

    @BeforeEach
    void setUp() {
        // Optional setup if needed before each test
    }

    @Test
    void createBooking_Success() {
        // Arrange
        BookingCreateRequest request = new BookingCreateRequest();
        request.setTimeSlotId(timeSlotId);

        TimeSlot slot = new TimeSlot();
        slot.setId(timeSlotId);
        slot.setStatus(Enums.TimeSlotStatus.AVAILABLE);
        slot.setPrice(BigDecimal.valueOf(100000));
        slot.setStartTime(LocalDateTime.now().plusDays(1));
        slot.setEndTime(LocalDateTime.now().plusDays(1).plusHours(1));

        Booking savedBooking = new Booking();
        savedBooking.setId("booking123");
        savedBooking.setTotalAmount(BigDecimal.valueOf(100000));

        BookingResponse response = new BookingResponse();
        response.setBookingId("booking123");

        when(timeSlotRepository.findById(timeSlotId)).thenReturn(Optional.of(slot));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), anyString(), anyLong(), any(TimeUnit.class))).thenReturn(true);
        when(bookingMapper.toEntity(any(BookingCreateRequest.class))).thenReturn(new Booking());
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(bookingMapper.toResponse(any(Booking.class), any())).thenReturn(response);

        // Act
        BookingResponse result = bookingService.createBooking(userId, request);

        // Assert
        assertNotNull(result);
        assertEquals("booking123", result.getBookingId());
        verify(timeSlotRepository, times(1)).save(any(TimeSlot.class));
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(eventPublisher, times(1)).publishEvent(any(BookingNotificationEvent.class));
        verify(redisTemplate, times(1)).delete(anyString()); // Verify finally block
    }

    @Test
    void createBooking_Fail_SlotNotAvailable() {
        // Arrange
        BookingCreateRequest request = new BookingCreateRequest();
        request.setTimeSlotId(timeSlotId);

        TimeSlot slot = new TimeSlot();
        slot.setId(timeSlotId);
        slot.setStatus(Enums.TimeSlotStatus.PENDING); // Not available

        when(timeSlotRepository.findById(timeSlotId)).thenReturn(Optional.of(slot));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            bookingService.createBooking(userId, request);
        });

        assertEquals(400, exception.getStatusCode());
        assertTrue(exception.getMessage().contains("Sân đã có người đặt"));
    }

    @Test
    void createBooking_Fail_RedisLocked() {
        // Arrange
        BookingCreateRequest request = new BookingCreateRequest();
        request.setTimeSlotId(timeSlotId);

        TimeSlot slot = new TimeSlot();
        slot.setId(timeSlotId);
        slot.setStatus(Enums.TimeSlotStatus.AVAILABLE);

        when(timeSlotRepository.findById(timeSlotId)).thenReturn(Optional.of(slot));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), anyString(), anyLong(), any(TimeUnit.class))).thenReturn(false);

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            bookingService.createBooking(userId, request);
        });

        assertEquals(409, exception.getStatusCode());
        assertTrue(exception.getMessage().contains("Hệ thống đang xử lý giao dịch"));
    }

    @Test
    void checkInBooking_Success() {
        // Arrange
        String bookingId = "booking123";
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(Enums.BookingStatus.DEPOSIT_PAID);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // Act
        bookingService.checkInBooking(bookingId);

        // Assert
        assertEquals(Enums.BookingStatus.COMPLETED, booking.getStatus());
        verify(bookingRepository, times(1)).save(booking);
    }

    @Test
    void checkInBooking_Fail_InvalidStatus() {
        // Arrange
        String bookingId = "booking123";
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(Enums.BookingStatus.PENDING);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            bookingService.checkInBooking(bookingId);
        });

        assertEquals(400, exception.getStatusCode());
        assertTrue(exception.getMessage().contains("Trạng thái đơn không hợp lệ"));
    }
}
