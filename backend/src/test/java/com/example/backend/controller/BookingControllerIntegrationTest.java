package com.example.backend.controller;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.service.BookingService;
import com.example.backend.utils.Enums;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.example.backend.security.JwtAuthenticationFilter;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = BookingController.class)
@AutoConfigureMockMvc(addFilters = false) // Bỏ qua Security Filter cho mục đích test web layer
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "user123", roles = "PLAYER")
    void getBookings_ReturnsList() throws Exception {
        BookingResponse response = new BookingResponse();
        response.setBookingId("booking1");
        List<BookingResponse> mockResponse = Collections.singletonList(response);

        when(bookingService.getBookings(any())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bookingId").value("booking1"));
    }

    @Test
    @WithMockUser(username = "user123", roles = "PLAYER")
    void createBooking_ReturnsCreated() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest();
        request.setTimeSlotId("slot1");
        
        BookingResponse response = new BookingResponse();
        response.setBookingId("booking1");

        when(bookingService.createBooking(any(), any(BookingCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingId").value("booking1"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void checkInCustomer_ReturnsOk() throws Exception {
        mockMvc.perform(put("/api/bookings/1/check-in")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Check-in thành công! Khách đã nhận sân."));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void checkOutCustomer_ReturnsOk() throws Exception {
        when(bookingService.checkOutBooking(anyString(), any(Enums.PaymentMethod.class)))
                .thenReturn("Check-out thành công");

        mockMvc.perform(post("/api/bookings/1/check-out")
                        .param("method", "CASH")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Check-out thành công"));
    }
}
