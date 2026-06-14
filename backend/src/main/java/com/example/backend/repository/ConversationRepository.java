package com.example.backend.repository;

import com.example.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    @Query("SELECT cm.conversation FROM ConversationMember cm WHERE cm.userId = :userId")
    List<Conversation> findConversationsByUserId(@Param("userId") String userId);

    @Query("SELECT c FROM Conversation c " +
           "JOIN c.members cm1 " +
           "JOIN c.members cm2 " +
           "WHERE c.type = :type " +
           "AND cm1.userId = :userId1 AND cm2.userId = :userId2")
    List<Conversation> findDirectConversationsBetweenUsers(
        @Param("type") com.example.backend.utils.Enums.ConversationType type,
        @Param("userId1") String userId1,
        @Param("userId2") String userId2
    );

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Conversation c WHERE c.id = :conversationId")
    void deleteConversationById(@Param("conversationId") String conversationId);
    List<Conversation> findByMatchId(String matchId);
}

