package com.example.backend.dto.response;

import com.example.backend.entity.Enums;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MatchPostResponse {
    private String id;
    private String userId;
    private String teamId;
    private String fieldId;
    private String bookingId;
    private LocalDate date;
    private LocalDateTime timeStart;
    private LocalDateTime timeEnd;
    private Enums.PostType postType;
    private Enums.TeamLevel skillLevel;
    private String costSharing;
    private String message;
    private Enums.PostStatus status;
    private LocalDateTime createdAt;

    public MatchPostResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }

    public String getFieldId() { return fieldId; }
    public void setFieldId(String fieldId) { this.fieldId = fieldId; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getTimeStart() { return timeStart; }
    public void setTimeStart(LocalDateTime timeStart) { this.timeStart = timeStart; }

    public LocalDateTime getTimeEnd() { return timeEnd; }
    public void setTimeEnd(LocalDateTime timeEnd) { this.timeEnd = timeEnd; }

    public Enums.PostType getPostType() { return postType; }
    public void setPostType(Enums.PostType postType) { this.postType = postType; }

    public Enums.TeamLevel getSkillLevel() { return skillLevel; }
    public void setSkillLevel(Enums.TeamLevel skillLevel) { this.skillLevel = skillLevel; }

    public String getCostSharing() { return costSharing; }
    public void setCostSharing(String costSharing) { this.costSharing = costSharing; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Enums.PostStatus getStatus() { return status; }
    public void setStatus(Enums.PostStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
