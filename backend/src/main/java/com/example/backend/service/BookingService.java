// File 5: service/BookingService.java
package com.example.backend.service;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Enums;

import java.util.List;

public interface BookingService {
    List<BookingResponse> getBookings(String userId);
    BookingResponse createBooking(String userId, BookingCreateRequest request);
    void checkInBooking (String bookingId);
    String checkOutBooking (String bookingId, Enums.PaymentMethod method);
    void markAsNoShow (String bookingId);
}