package com.example.backend.dto.response;

import com.example.backend.utils.Enums;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String bookingId; 
    private String fieldId;
    private String timeSlotId;
    private String userId;
    private Enums.BookingStatus status;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private LocalDate bookingDate;
    private String note;
    private LocalDateTime createdAt;
    private String message;
    private String startTime;
    private String endTime;
}