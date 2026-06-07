package com.example.backend.repository;

import com.example.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    
    boolean existsByBookingId(String bookingId);
    
    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Review> findByFieldIdOrderByCreatedAtDesc(String fieldId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.fieldId = :fieldId")
    Double getAverageRatingByFieldId(@Param("fieldId") String fieldId);
}