package com.example.backend.repository.redis;

import com.example.backend.entity.redis.ChatSession;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatSessionRepository extends CrudRepository<ChatSession, String> {
}