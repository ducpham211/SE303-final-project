package com.example.backend.repository;

import com.example.backend.entity.Booking;
import com.example.backend.entity.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByFieldIdAndBookingDate(String fieldId, LocalDate bookingDate);
    List<Booking> findByStatusAndCreatedAtBefore(Enums.BookingStatus status, LocalDateTime deadline);
}

