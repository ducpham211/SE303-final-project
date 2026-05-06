package com.example.backend.dto.response;

import lombok.Data;

@Data
public class DashboardOverviewResponse{
    long totalUsers;
    long totalFields;
    long totalSuccessfulMatches;

    public DashboardOverviewResponse(long totalUsers, long totalFields, long totalMatches) {
        this.totalUsers = totalUsers;
        this.totalFields = totalFields;
        this.totalSuccessfulMatches = totalMatches;
    }
}