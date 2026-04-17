package com.example.backend.repository;

import com.example.backend.utils.Enums;
import com.example.backend.entity.MatchPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchPostRepository extends JpaRepository<MatchPost, String> {
    @Query("SELECT m FROM MatchPost m WHERE " +
            "(:#{#skillLevel == null} = true OR m.skillLevel = :skillLevel) AND " +
            "(:#{#postType == null} = true OR m.postType = :postType) " +
            "ORDER BY m.createdAt DESC")
    Page<MatchPost> filterMatchPosts(
            @Param("skillLevel") Enums.TeamLevel skillLevel,
            @Param("postType") Enums.PostType postType,
            Pageable pageable
    );
    @Query("SELECT m FROM MatchPost m WHERE m.status = 'OPEN' AND m.userId != :currentUserId ORDER BY m.createdAt DESC")
    Page<MatchPost> findPotentialMatches(@Param("currentUserId") String currentUserId, Pageable pageable);
}

