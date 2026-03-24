package com.example.backend.service;

import com.example.backend.dto.response.FieldDetailResponse;
import com.example.backend.dto.response.FieldResponse;
import com.example.backend.dto.response.TimeSlotAvailabilityResponse;
import com.example.backend.entity.Enums;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public interface FieldService {
    List<FieldResponse> getFields(Enums.FieldType type, BigDecimal minPrice, BigDecimal maxPrice);
    
    FieldDetailResponse getFieldById(String id);
    
    List<TimeSlotAvailabilityResponse> getFieldAvailability(String id, LocalDate date);
}
