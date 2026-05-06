package com.example.backend.repository;

import com.example.backend.entity.MatchRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
    public interface MatchRequestRepository extends JpaRepository<MatchRequest, String> {
        boolean existsByPostIdAndRequesterId(String postId, String requesterId);

        @Query("SELECT COUNT(m) FROM MatchRequest m WHERE m.status = 'ACCEPTED'")
        long countSuccessfulMatches();

        // Thêm hàm này để lấy các request còn lại của bài đăng (tính năng Auto-Reject)
        List<MatchRequest> findByPostId(String postId);
    }