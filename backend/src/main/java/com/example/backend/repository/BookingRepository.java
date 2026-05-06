package com.example.backend.repository;

import com.example.backend.entity.Booking;
import com.example.backend.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByFieldIdAndBookingDate(String fieldId, LocalDate bookingDate);
    List<Booking> findByStatusAndCreatedAtBefore(Enums.BookingStatus status, LocalDateTime deadline);
    List<Booking> findByUserId(String userId);
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = 'COMPLETED'")
    java.math.BigDecimal calculateTotalSystemRevenue();

    // 2. Đếm số lượng hóa đơn thành công
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'COMPLETED'")
    long countSuccessfulBookings();
}

