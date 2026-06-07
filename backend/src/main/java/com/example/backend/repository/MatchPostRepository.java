package com.example.backend.repository;

import com.example.backend.utils.Enums;
import com.example.backend.entity.MatchPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchPostRepository extends JpaRepository<MatchPost, String> {
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT m FROM MatchPost m WHERE " +
            "(:#{#skillLevel == null} = true OR m.skillLevel = :skillLevel) AND " +
            "(:#{#postType == null} = true OR m.postType = :postType) AND " +
            "(m.message IS NULL OR m.message NOT LIKE '[LIVE_MATCH]%') " +
            "ORDER BY m.createdAt DESC")
    Page<MatchPost> filterMatchPosts(
            @Param("skillLevel") Enums.TeamLevel skillLevel,
            @Param("postType") Enums.PostType postType,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT m FROM MatchPost m WHERE (m.status = 'OPEN' OR m.status = 'CLOSED') AND m.message LIKE '[LIVE_MATCH]%' ORDER BY m.createdAt DESC")
    List<MatchPost> findActiveLiveMatches();

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT m FROM MatchPost m WHERE m.status = 'OPEN' AND m.userId != :currentUserId ORDER BY m.createdAt DESC")
    Page<MatchPost> findPotentialMatches(@Param("currentUserId") String currentUserId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT m FROM MatchPost m WHERE m.userId = :userId AND m.status != 'CLOSED' AND m.status != 'COMPLETED' ORDER BY m.createdAt DESC")
    Page<MatchPost> findMyActivePosts(@Param("userId") String userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT DISTINCT m FROM MatchPost m LEFT JOIN m.requests r WHERE " +
           "((m.userId = :userId AND (m.status = 'CLOSED' OR m.status = 'COMPLETED' OR size(m.requests) > 0)) " +
           "OR (r.requesterId = :userId)) " +
           "AND (m.message IS NULL OR m.message NOT LIKE '[LIVE_MATCH]%') " +
           "ORDER BY m.createdAt DESC")
    Page<MatchPost> findMatchHistory(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT m FROM MatchPost m WHERE m.message LIKE '[LIVE_MATCH]%' AND m.createdAt < :deadline")
    List<MatchPost> findExpiredLiveMatches(@Param("deadline") java.time.LocalDateTime deadline);
}

