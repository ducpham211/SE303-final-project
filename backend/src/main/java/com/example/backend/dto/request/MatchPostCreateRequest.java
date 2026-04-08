package com.example.backend.dto.request;

import com.example.backend.utils.Enums;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
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

}
