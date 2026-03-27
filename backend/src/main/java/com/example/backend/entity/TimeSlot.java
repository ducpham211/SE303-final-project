package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "time_slots")
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "field_id")
    private String fieldId;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private Enums.TimeSlotStatus status;

    @ManyToOne
    @JoinColumn(name = "field_id", insertable = false, updatable = false)
    private Field field;

    @OneToMany(mappedBy = "timeSlot")
    private List<Booking> bookings;

    // getters/setters
    public TimeSlot() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }


    public String getFieldId() { return fieldId; }
    public void setFieldId(String fieldId) { this.fieldId = fieldId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Enums.TimeSlotStatus getStatus() { return status; }
    public void setStatus(Enums.TimeSlotStatus status) { this.status = status; }
}
