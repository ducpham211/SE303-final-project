// repository/ReviewRepository.java
package com.example.backend.repository;

import com.example.backend.utils.Enums;
import com.example.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    // Hỗ trợ truy vấn nhanh sau này
    boolean existsByMatchRequestIdAndReviewerId(String matchRequestId, String reviewerId);
    List<Review> findByRevieweeId(String revieweeId);
    List<Review> findByMatchRequestId(String matchRequestId);
    Page<Review> findByStatus(Enums.ReviewStatus status, Pageable pageable);
}