package com.example.backend.repository;

import com.example.backend.entity.ConversationMember;
import com.example.backend.entity.ConversationMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, ConversationMemberId> {
    
    boolean existsByConversationIdAndUserId(String conversationId, String userId);

    // Dùng để tìm người đang chat cùng mình
    List<ConversationMember> findByConversationId(String conversationId);

    // Dùng để xóa thành viên khỏi nhóm chat (khi bị kick khỏi đội)
    @Transactional
    void deleteByConversationIdAndUserId(String conversationId, String userId);
}