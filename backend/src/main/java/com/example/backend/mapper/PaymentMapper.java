package com.example.backend.mapper;

import com.example.backend.dto.response.PaymentResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Enums;
import com.example.backend.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface PaymentMapper {
    @Mapping(target = "id", ignore = true)
    Payment toReponse(PaymentResponse request);
    default Payment createPaymentEntity(Booking booking, BigDecimal amount, Enums.PaymentMethod method, String transactionId) {
        Payment payment = new Payment();
        payment.setBookingId(booking.getId());
        payment.setUserId(booking.getUserId());
        payment.setAmount(amount);
        payment.setPaymentMethod(method);
        payment.setStripePaymentIntentId(transactionId);
        payment.setStatus(Enums.PaymentStatus.SUCCESS);
        payment.setCreatedAt(LocalDateTime.now());
        return payment;
    }
}
