package com.example.backend.entity;

import com.example.backend.utils.Enums;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "opponent_reviews")
@Data
public class OpponentReview {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "match_id")
    private String matchId;

    @Column(name = "reviewer_id")
    private String reviewerId;

    @Column(name = "reviewee_id")
    private String revieweeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "rating_type")
    private Enums.OpponentRatingType ratingType;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    private Enums.FairplayStatus status = Enums.FairplayStatus.PENDING;

    @Column(name = "points_applied")
    private Integer pointsApplied = 0;

    @Column(name = "is_toxic")
    private Boolean isToxic = false;

    @Column(name = "ai_suggested_penalty")
    private Integer aiSuggestedPenalty = 0;

    @Column(name = "ai_reason", columnDefinition = "TEXT")
    private String aiReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // THÊM @JsonIgnore VÀO 2 TRƯỜNG NÀY ĐỂ TRÁNH LỖI KHI GỌI API
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", insertable = false, updatable = false)
    private User reviewer;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", insertable = false, updatable = false)
    private User reviewee;

    @Column(name = "image_url")
    private String imageUrl;
}