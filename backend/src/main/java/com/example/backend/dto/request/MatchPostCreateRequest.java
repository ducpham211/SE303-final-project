package com.example.backend.dto.request;

import com.example.backend.entity.Enums;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class MatchPostCreateRequest {
    private String teamId; // Có thể Null (nếu họ là cá nhân đi tìm team)

    private String fieldId; // Có thể Null (chưa chốt đá sân nào)

    private String bookingId; // Có thể Null (chưa đặt cọc sân như anh em mình vừa bàn)

    private LocalDate date;

    private LocalDateTime timeStart;

    private LocalDateTime timeEnd;

    private Enums.PostType postType; // Ví dụ: FIND_OPPONENT (Tìm đối), FIND_MEMBER (Tìm đồng đội)

    private Enums.TeamLevel skillLevel;

    private String costSharing;

    private String message; // Ghi chú thêm, cho phép bỏ trống

    public MatchPostCreateRequest() {}

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
}
