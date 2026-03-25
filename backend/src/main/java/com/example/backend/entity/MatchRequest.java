package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "match_requests")
public class MatchRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "post_id")
    private String postId;

    @Column(name = "requester_id")
    private String requesterId;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private Enums.RequestStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "post_id", insertable = false, updatable = false)
    private MatchPost post;

    @ManyToOne
    @JoinColumn(name = "requester_id", insertable = false, updatable = false)
    private User requester;

    // getters/setters
    public MatchRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getRequesterId() { return requesterId; }
    public void setRequesterId(String requesterId) { this.requesterId = requesterId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Enums.RequestStatus getStatus() { return status; }
    public void setStatus(Enums.RequestStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
