package com.example.backend.service;

import com.example.backend.dto.request.FieldCreateRequest;
import com.example.backend.dto.request.FieldUpdateRequest;
import com.example.backend.dto.request.TimeSlotCreateRequest;
import com.example.backend.dto.request.TimeSlotUpdateRequest;
import com.example.backend.dto.response.FieldDetailResponse;
import com.example.backend.dto.response.FieldResponse;
import com.example.backend.dto.response.TimeSlotAvailabilityResponse;
import com.example.backend.dto.response.TimeSlotResponse;
import com.example.backend.utils.Enums;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


public interface FieldService {
    List<FieldResponse> getFields(Enums.FieldType type, BigDecimal minPrice, BigDecimal maxPrice);
    
    FieldDetailResponse getFieldById(String id);
    
    List<TimeSlotAvailabilityResponse> getFieldAvailability(String id, LocalDate date);

    FieldResponse createField(FieldCreateRequest request);

    FieldResponse updateField(String id, FieldUpdateRequest request);

    TimeSlotResponse createTimeSlot(String fieldId, TimeSlotCreateRequest request);

    TimeSlotResponse updateTimeSlot(String fieldId, String slotId, TimeSlotUpdateRequest request);

    FieldResponse deleteField(String id);

    TimeSlotResponse deleteTimeSlot(String fieldId, String slotId);
}
