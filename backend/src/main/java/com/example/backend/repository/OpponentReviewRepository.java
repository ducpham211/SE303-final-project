package com.example.backend.repository;

import com.example.backend.entity.OpponentReview;
import com.example.backend.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OpponentReviewRepository extends JpaRepository<OpponentReview, String> {
    List<OpponentReview> findByStatusOrderByCreatedAtDesc(Enums.FairplayStatus status);
    List<OpponentReview> findByRevieweeIdOrderByCreatedAtDesc(String revieweeId);

    // Kiểm tra xem đã gửi đánh giá chưa
    boolean existsByMatchIdAndReviewerId(String matchId, String reviewerId);

    // Lấy danh sách ID trận đấu đã đánh giá
    @Query("SELECT r.matchId FROM OpponentReview r WHERE r.reviewerId = :reviewerId")
    List<String> findMatchIdsByReviewerId(@Param("reviewerId") String reviewerId);
}