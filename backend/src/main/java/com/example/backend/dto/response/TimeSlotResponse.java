package com.example.backend.dto.response;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public class TimeSlotResponse {
    private String id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal price;

    public TimeSlotResponse() {}

    public TimeSlotResponse(String id, LocalDateTime startTime, LocalDateTime endTime, BigDecimal price) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.price = price;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
