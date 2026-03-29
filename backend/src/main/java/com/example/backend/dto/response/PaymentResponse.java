package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private String url;
    private String message;
    private String id;
    private String bookingId;
    private BigDecimal amount;
    private String paymentMethod;
    private String stripePaymentIntentId;
    private String status;
    private LocalDateTime createdAt;

}