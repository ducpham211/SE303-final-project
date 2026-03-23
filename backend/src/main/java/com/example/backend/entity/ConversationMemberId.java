package com.example.backend.entity;

import java.io.Serializable;

public class ConversationMemberId implements Serializable {
    private String conversationId;
    private String userId;

    public ConversationMemberId() {}

    public ConversationMemberId(String conversationId, String userId) {
        this.conversationId = conversationId;
        this.userId = userId;
    }

    // equals & hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConversationMemberId that = (ConversationMemberId) o;
        return java.util.Objects.equals(conversationId, that.conversationId) && java.util.Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(conversationId, userId);
    }
}
