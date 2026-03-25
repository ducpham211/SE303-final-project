package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "conversation_members")
@IdClass(ConversationMemberId.class)
public class ConversationMember {

    @Id
    @Column(name = "conversation_id")
    private String conversationId;

    @Id
    @Column(name = "user_id")
    private String userId;

    @ManyToOne
    @JoinColumn(name = "conversation_id", insertable = false, updatable = false)
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    // getters/setters
    public ConversationMember() {}

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
