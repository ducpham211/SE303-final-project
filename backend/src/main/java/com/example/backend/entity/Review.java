package com.example.backend.entity;

import com.example.backend.utils.Enums;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Thay @JoinColumn bằng @Column
    @Column(name = "reviewer_id")
    private String reviewerId; // Người viết đánh giá

    @Column(name = "reviewee_id")
    private String revieweeId; // Người bị đánh giá

    @Column(name = "match_request_id")
    private String matchRequestId; // Trận đấu nào

    @Column(name = "score_change")
    private Integer scoreChange; // Số điểm trừ CHÍNH THỨC (do Admin chốt)

    @Column(columnDefinition = "TEXT")
    private String reason; // Nội dung review người dùng viết

    @Column(name = "ai_suggested_penalty")
    private Integer aiSuggestedPenalty; // Điểm trừ AI đề xuất (VD: -10)

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private Enums.ReviewStatus status;
    // AUTO_PASSED (Không lỗi), PENDING_ADMIN_REVIEW (Chờ duyệt), PENALIZED (Đã trừ chính thức)

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}