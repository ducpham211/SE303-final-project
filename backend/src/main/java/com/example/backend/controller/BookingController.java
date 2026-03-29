package com.example.backend.controller;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getBookings(@AuthenticationPrincipal String userId){
        List<BookingResponse> result = bookingService.getBookings(userId);
        return ResponseEntity.ok(result);
    }
    @PostMapping
    @PreAuthorize("hasAnyRole('PLAYER', 'OWNER')")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingCreateRequest request,
            @AuthenticationPrincipal String userId) { // Lấy ID user từ token

        BookingResponse response = bookingService.createBooking(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    // API CHECK-IN KHI KHÁCH ĐẾN
    @PutMapping("/{id}/check-in")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<String> checkInCustomer(@PathVariable("id") String bookingId) {
        try {
            bookingService.checkInBooking(bookingId);
            return ResponseEntity.ok("Check-in thành công! Khách đã nhận sân.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API CHECK-OUT VÀ THU TIỀN MẶT CÒN LẠI
    @PutMapping("/{id}/check-out")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<String> checkOutCustomer(@PathVariable("id") String bookingId) {
        try {
            String message = bookingService.checkOutBooking(bookingId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/{id}/no-show")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<String> markNoShow(@PathVariable("id") String bookingId) {
        try {
            bookingService.markAsNoShow(bookingId);
            return ResponseEntity.ok("Đã đánh dấu khách không đến. Tịch thu cọc thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}