package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_posts")
public class MatchPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "team_id")
    private String teamId;

    @Column(name = "field_id")
    private String fieldId;

    @Column(name = "booking_id")
    private String bookingId;

    private LocalDate date;
    @Column(name = "time_start")
    private LocalDateTime timeStart;
    @Column(name = "time_end")
    private LocalDateTime timeEnd;

    @Enumerated(EnumType.STRING)
    private Enums.PostType postType;

    @Enumerated(EnumType.STRING)
    private Enums.TeamLevel skillLevel;

    @Column(name = "cost_sharing")
    private String costSharing;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private Enums.PostStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    // getters/setters
    public MatchPost() {}

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
