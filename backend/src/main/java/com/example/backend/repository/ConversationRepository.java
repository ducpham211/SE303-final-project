package com.example.backend.repository;

import com.example.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    @Query("SELECT cm.conversation FROM ConversationMember cm WHERE cm.userId = :userId")
    List<Conversation> findConversationsByUserId(@Param("userId") String userId);
}

