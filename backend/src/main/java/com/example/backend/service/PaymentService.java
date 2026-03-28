package com.example.backend.service;

import com.example.backend.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse createCheckoutSession(String bookingId);
    void handleStripeWebhook(String payload, String sigHeader);
}