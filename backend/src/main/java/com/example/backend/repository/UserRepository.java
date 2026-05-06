package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.backend.utils.Enums;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    @Query("SELECT u FROM User u WHERE " +
            "(:#{#role == null} = true OR u.role = :role) AND " +
            "(:#{#minTrustScore == null} = true OR u.trustScore >= :minTrustScore)")
    Page<User> findUsersByFilters(
            @Param("role") Enums.UserRole role,
            @Param("minTrustScore") Integer minTrustScore,
            Pageable pageable
    );
}
