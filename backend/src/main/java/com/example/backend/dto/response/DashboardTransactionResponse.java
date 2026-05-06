package com.example.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class DashboardTransactionResponse {
    BigDecimal totalSystemRevenue; // Tổng tiền gộp lại
    long totalSuccessfulBookings;

    public DashboardTransactionResponse(BigDecimal totalRevenue, long totalBookings) {
        this.totalSystemRevenue = totalRevenue;
        this.totalSuccessfulBookings = totalBookings;
    }
}
