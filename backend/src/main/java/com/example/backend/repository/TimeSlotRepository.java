package com.example.backend.repository;

import com.example.backend.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, String> {
    boolean existsByFieldIdAndStartTime(String fieldId, LocalDateTime startTime);
    List<TimeSlot> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}

