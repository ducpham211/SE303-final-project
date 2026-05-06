package com.example.backend.service.impl;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.request.PaymentCreateRequest;
import com.example.backend.dto.response.PaymentResponse;
import com.example.backend.entity.Booking;
import com.example.backend.utils.Enums;
import com.example.backend.entity.Payment;
import com.example.backend.entity.TimeSlot;
import com.example.backend.entity.User;
import com.example.backend.mapper.PaymentMapper;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.TimeSlotRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.NotificationService;
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
import java.time.LocalDateTime;
import com.example.backend.exception.AppException;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentServiceImpl implements PaymentService {

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final UserRepository userRepository; 

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

    private String truncateId(String id) {
        if (id == null || id.isEmpty()) return "Chưa xác định";
        return id.length() >= 6 ? id.substring(0, 6).toUpperCase() : id.toUpperCase();
    }

    @Transactional
    @Override
    public PaymentResponse createCheckoutSession(String bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy hóa đơn"));

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

            return PaymentResponse.builder()
                    .url(session.getUrl())
                    .message("Tạo link thanh toán Stripe thành công")
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi tạo phiên thanh toán Stripe: ", e);
            throw new AppException(400, "Không thể tạo phiên thanh toán");
        }
    }

    @Transactional
    @Override
    public void handleStripeWebhook(String payload, String sigHeader) {
        try {
            com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(
                    payload, sigHeader, endpointSecret
            );

            if ("checkout.session.completed".equals(event.getType())) {

                com.stripe.model.checkout.Session session;
                com.stripe.model.EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();

                if (deserializer.getObject().isPresent()) {
                    session = (com.stripe.model.checkout.Session) deserializer.getObject().get();
                } else {
                    log.warn("Đang dùng deserializeUnsafe vì lệch phiên bản API Stripe");
                    session = (com.stripe.model.checkout.Session) deserializer.deserializeUnsafe();
                }

                String bookingId = session.getClientReferenceId();

                if (bookingId == null) {
                    log.error("==== WEBHOOK ==== Không tìm thấy bookingId trong phiên thanh toán!");
                    return;
                }

                log.info("==== WEBHOOK ==== Khách đã thanh toán thành công cho Booking ID: {}", bookingId);

                Booking booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null) {

                    // Cập nhật trạng thái Hóa đơn
                    booking.setStatus(Enums.BookingStatus.DEPOSIT_PAID);
                    bookingRepository.save(booking);

                    // Khóa ca sân
                    TimeSlot slot = timeSlotRepository.findById(booking.getTimeSlotId()).orElse(null);
                    if (slot != null) {
                        slot.setStatus(Enums.TimeSlotStatus.BOOKED);
                        timeSlotRepository.save(slot);
                    }

                    // Ghi nhận dòng tiền
                    PaymentCreateRequest paymentRequest = new PaymentCreateRequest();
                    paymentRequest.setAmount(booking.getDepositAmount());
                    paymentRequest.setPaymentMethod(Enums.PaymentMethod.STRIPE);
                    paymentRequest.setStripePaymentIntentId(session.getPaymentIntent());
                    paymentRequest.setBookingId(bookingId);
                    paymentRequest.setUserId(booking.getUserId());
                    paymentRequest.setStatus(Enums.PaymentStatus.SUCCESS);
                    
                    Payment depositPayment = paymentMapper.createPaymentEntity(paymentRequest);
                    depositPayment.setBooking(booking); 
                    depositPayment.setCreatedAt(LocalDateTime.now());
                    paymentRepository.save(depositPayment);

                    // Bắn thông báo về hệ thống
                    User player = userRepository.findById(booking.getUserId()).orElse(null);
                    String playerName = player != null ? player.getFullName() : "Bạn";
                    String fieldCode = truncateId(booking.getFieldId());
                    String bookingCode = truncateId(bookingId);

                    NotificationCreateRequest notifRequest = new NotificationCreateRequest();
                    notifRequest.setTitle("🎉 Thanh toán thành công!");
                    
                    // Sử dụng .doubleValue() để tránh văng lỗi khi format BigDecimal
                    String content = "Hệ thống xác nhận " + playerName + " đã thanh toán thành công số tiền " 
                                    + String.format("%,.0f", booking.getDepositAmount().doubleValue()) 
                                    + " VND tiền cọc cho sân " + fieldCode 
                                    + " (Mã đơn: " + bookingCode + "). Chúc bạn có trận đấu vui vẻ!";
                    notifRequest.setContent(content);
                    notifRequest.setType(Enums.NotificationType.PAYMENT_UPDATE);
                    notificationService.createAndSendNotification(booking.getUserId(), notifRequest);

                    log.info("==== KẾ TOÁN ==== Đã lưu DB khoản cọc {} VND qua STRIPE cho Booking {}", booking.getDepositAmount(), bookingId);
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