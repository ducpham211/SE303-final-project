package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    private Enums.ConversationType type;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "conversation")
    private List<ConversationMember> members;

    @OneToMany(mappedBy = "conversation")
    private List<Message> messages;

    // getters/setters
    public Conversation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Enums.ConversationType getType() { return type; }
    public void setType(Enums.ConversationType type) { this.type = type; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
