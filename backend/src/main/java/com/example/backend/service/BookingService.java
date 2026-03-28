// File 5: service/BookingService.java
package com.example.backend.service;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;

public interface BookingService {
    BookingResponse createBooking(String userId, BookingCreateRequest request);
}