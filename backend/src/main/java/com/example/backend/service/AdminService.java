package com.example.backend.service;

import com.example.backend.dto.request.AdminCreateRequest;
import com.example.backend.dto.response.DashboardOverviewResponse;
import com.example.backend.dto.response.DashboardTransactionResponse;
import com.example.backend.dto.response.FieldResponse;

import java.util.List;

public interface AdminService {
    String adjudicateReview(String reviewId, AdminCreateRequest request);
    List<FieldResponse> getAllFields();
    DashboardOverviewResponse getOverviewMetrics();
    DashboardTransactionResponse getTransactionMetrics();
}
