package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "captain_id")
    private String captainId;

    @Enumerated(EnumType.STRING)
    private Enums.TeamLevel level;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "captain_id", insertable = false, updatable = false)
    private User captain;

    // getters & setters
    public Team() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCaptainId() { return captainId; }
    public void setCaptainId(String captainId) { this.captainId = captainId; }

    public Enums.TeamLevel getLevel() { return level; }
    public void setLevel(Enums.TeamLevel level) { this.level = level; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getCaptain() { return captain; }
    public void setCaptain(User captain) { this.captain = captain; }
}
