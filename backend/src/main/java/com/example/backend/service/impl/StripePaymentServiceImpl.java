package com.example.backend.service.impl;

import com.example.backend.dto.response.PaymentResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Enums;
import com.example.backend.entity.TimeSlot;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.TimeSlotRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentServiceImpl implements PaymentService {
    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.success.url}")
    private String successUrl;

    @Value("${stripe.cancel.url}")
    private String cancelUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @Override
    public PaymentResponse createCheckoutSession(String bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

            long totalAmount = booking.getTotalAmount().longValue();
            long depositAmount = (long) (totalAmount * 0.3);

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl)
                    .setClientReferenceId(bookingId)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("vnd")
                                                    .setUnitAmount(depositAmount)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Thanh toán tiền sân")
                                                                    .build())
                                                    .build())
                                    .build())
                    .build();

            Session session = Session.create(params);
            booking.setDepositAmount(BigDecimal.valueOf(depositAmount));
            bookingRepository.save(booking);
            // 👉 Trả về hẳn 1 cái DTO xịn xò
            return new PaymentResponse(session.getUrl(), "Tạo link thanh toán Stripe thành công");

        } catch (Exception e) {
            log.error("Lỗi khi tạo phiên thanh toán Stripe: ", e);
            throw new RuntimeException("Không thể tạo phiên thanh toán");
        }
    }
    public void handleStripeWebhook(String payload, String sigHeader) {
        try {
            // 1. Xác thực chữ ký: Đảm bảo người gọi đúng là tổng đài Stripe, không phải hacker
            com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(
                    payload, sigHeader, endpointSecret
            );

            // 2. Chỉ quan tâm đến sự kiện "Khách đã thanh toán thành công"
            if ("checkout.session.completed".equals(event.getType())) {

                com.stripe.model.checkout.Session session;
                com.stripe.model.EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();

                // 👉 SỬ DỤNG CƠ CHẾ AN TOÀN KHI BỊ LỆCH PHIÊN BẢN API
                if (deserializer.getObject().isPresent()) {
                    session = (com.stripe.model.checkout.Session) deserializer.getObject().get();
                } else {
                    // Búa tạ: Ép giải mã khi bị lệch version
                    log.warn("Đang dùng deserializeUnsafe vì lệch phiên bản API Stripe");
                    session = (com.stripe.model.checkout.Session) deserializer.deserializeUnsafe();
                }

                // Lấy cái ID hóa đơn mà hôm trước mình đã nhét vào
                String bookingId = session.getClientReferenceId();

                if (bookingId == null) {
                    log.error("==== WEBHOOK ==== Không tìm thấy bookingId trong phiên thanh toán!");
                    return;
                }

                log.info("==== WEBHOOK ==== Khách đã thanh toán thành công cho Booking ID: {}", bookingId);

                // 3. ĐỔI TRẠNG THÁI DB
                Booking booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null) {
                    booking.setStatus(Enums.BookingStatus.DEPOSIT_PAID);
                    bookingRepository.save(booking);

                    TimeSlot slot = timeSlotRepository.findById(booking.getTimeSlotId()).orElse(null);
                    if (slot != null) {
                        slot.setStatus(Enums.TimeSlotStatus.BOOKED);
                        timeSlotRepository.save(slot);
                    }
                    log.info("==== WEBHOOK ==== Đã chốt sân thành công!");
                } else {
                    log.error("==== WEBHOOK ==== Không tìm thấy hóa đơn {} trong Database", bookingId);
                }
            }

        } catch (com.stripe.exception.SignatureVerificationException e) {
            log.error("==== WEBHOOK ==== Cảnh báo: Chữ ký giả mạo hoặc sai Secret Key!", e);
        } catch (Exception e) {
            log.error("==== WEBHOOK ==== Lỗi trong quá trình xử lý Webhook: ", e);
        }
    }

    }