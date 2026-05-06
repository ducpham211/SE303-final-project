package com.example.backend.dto.request;

import lombok.Data;

@Data
public class BookingCreateRequest {
    private String timeSlotId;
    private String note;
}