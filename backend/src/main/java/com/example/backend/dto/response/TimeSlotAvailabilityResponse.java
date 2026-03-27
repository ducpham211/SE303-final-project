package com.example.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class TimeSlotAvailabilityResponse {
    private String id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal price;
    private boolean isAvailable;

    public TimeSlotAvailabilityResponse() {}

    public TimeSlotAvailabilityResponse(String id, LocalDateTime startTime, LocalDateTime endTime, BigDecimal price, boolean isAvailable) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.price = price;
        this.isAvailable = isAvailable;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}
