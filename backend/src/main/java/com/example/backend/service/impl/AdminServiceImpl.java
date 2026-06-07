package com.example.backend.service.impl;

import com.example.backend.dto.request.AdminCreateRequest;
import com.example.backend.dto.response.DashboardOverviewResponse;
import com.example.backend.dto.response.DashboardTransactionResponse;
import com.example.backend.dto.response.FieldResponse;
import com.example.backend.mapper.FieldMapper;
import com.example.backend.repository.*;
import com.example.backend.service.AdminService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
@AllArgsConstructor
public class AdminServiceImpl implements AdminService {
    // Đã xóa ReviewRepository vì không cần nữa
    private final UserRepository userRepository;
    private final FieldRepository fieldRepository;
    private final BookingRepository bookingRepository;
    private final MatchRequestRepository matchRequestRepository;
    private final FieldMapper fieldMapper;

    // HÀM ADJUDICATE REVIEW ĐÃ BỊ XÓA (CHUYỂN SANG FAIRPLAY SERVICE)

    @Override
    public List<FieldResponse> getAllFields() {
        return fieldRepository.findAll().stream()
                .map(fieldMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DashboardOverviewResponse getOverviewMetrics() {
        long totalUsers = userRepository.count();
        long totalFields = fieldRepository.count();
        long totalMatches = matchRequestRepository.countSuccessfulMatches();

        return new DashboardOverviewResponse(totalUsers, totalFields, totalMatches);
    }

    @Override
    public DashboardTransactionResponse getTransactionMetrics() {
        var totalRevenue = bookingRepository.calculateTotalSystemRevenue();
        var totalBookings = bookingRepository.countSuccessfulBookings();

        return new DashboardTransactionResponse(totalRevenue, totalBookings);
    }

 
}