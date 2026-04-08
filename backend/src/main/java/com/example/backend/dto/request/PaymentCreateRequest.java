package com.example.backend.dto.request;

import com.example.backend.utils.Enums;
import lombok.Data;

import java.math.BigDecimal;
@Data
public class PaymentCreateRequest {
    private String bookingId;
    private String userId;
    private BigDecimal amount;
    private Enums.PaymentMethod paymentMethod;
    private String stripePaymentIntentId;
    private Enums.PaymentStatus status;
}
