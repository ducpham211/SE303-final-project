package com.example.backend.dto.response;

import com.example.backend.entity.Enums;
import java.util.List;

public class FieldDetailResponse {
    private String id;
    private String name;
    private Enums.FieldType type;
    private String coverImage;
    private Enums.FieldStatus status;
    private List<TimeSlotResponse> timeSlots;

    public FieldDetailResponse() {}

    public FieldDetailResponse(String id, String name, Enums.FieldType type, String coverImage, Enums.FieldStatus status, List<TimeSlotResponse> timeSlots) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.coverImage = coverImage;
        this.status = status;
        this.timeSlots = timeSlots;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Enums.FieldType getType() { return type; }
    public void setType(Enums.FieldType type) { this.type = type; }
    
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    
    public Enums.FieldStatus getStatus() { return status; }
    public void setStatus(Enums.FieldStatus status) { this.status = status; }
    
    public List<TimeSlotResponse> getTimeSlots() { return timeSlots; }
    public void setTimeSlots(List<TimeSlotResponse> timeSlots) { this.timeSlots = timeSlots; }
}
