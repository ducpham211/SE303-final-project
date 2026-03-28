package com.example.backend.dto.request;

import lombok.Data;

@Data
public class BookingCreateRequest {
    private String timeSlotId;
    private String note;

    // Bác có thể thêm mã voucher, ghi chú... vào đây sau
}