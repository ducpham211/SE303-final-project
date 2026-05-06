package com.example.backend.controller;

import com.example.backend.dto.response.PaymentResponse;
import com.example.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import com.example.backend.exception.AppException;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@AllArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-session/{bookingId}")
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER')") // Chặn ông nào không đăng nhập mà đòi thanh toán
    public ResponseEntity<PaymentResponse> createPaymentSession(@PathVariable String bookingId) {
        PaymentResponse response = paymentService.createCheckoutSession(bookingId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> stripeWebhook(@RequestBody String payload, HttpServletRequest request) {
        // Lấy chữ ký điện tử mà Stripe nhét trong Header
        String sigHeader = request.getHeader("Stripe-Signature");// Ném sang Service xử lý
        paymentService.handleStripeWebhook(payload, sigHeader);
        // Trả về 200 OK để báo cho Stripe
        return ResponseEntity.ok("Received");
    }
}