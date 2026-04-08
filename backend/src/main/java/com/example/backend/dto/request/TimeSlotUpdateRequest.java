package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.backend.utils.Enums;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotUpdateRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal price;
    private Enums.TimeSlotStatus status;
}
