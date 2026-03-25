package com.example.backend.repository;

import com.example.backend.entity.MatchPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchPostRepository extends JpaRepository<MatchPost, String> {
}

