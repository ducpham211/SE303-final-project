package com.example.backend.service.impl;

import com.example.backend.dto.response.FieldDetailResponse;
import com.example.backend.dto.response.FieldResponse;
import com.example.backend.dto.response.TimeSlotAvailabilityResponse;
import com.example.backend.dto.response.TimeSlotResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Enums;
import com.example.backend.entity.Field;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.FieldRepository;
import com.example.backend.service.FieldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FieldServiceImpl implements FieldService {

    private final FieldRepository fieldRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public FieldServiceImpl(FieldRepository fieldRepository, BookingRepository bookingRepository) {
        this.fieldRepository = fieldRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public List<FieldResponse> getFields(Enums.FieldType type, BigDecimal minPrice, BigDecimal maxPrice) {
        List<Field> fields = fieldRepository.findFieldsWithFilters(type, minPrice, maxPrice);
        return fields.stream()
                .map(f -> new FieldResponse(f.getId(), f.getName(), f.getType(), f.getCoverImage(), f.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public FieldDetailResponse getFieldById(String id) {
        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Field not found with id: " + id));

        List<TimeSlotResponse> timeSlotResponses = field.getTimeSlots().stream()
                .map(ts -> new TimeSlotResponse(ts.getId(), ts.getStartTime(), ts.getEndTime(), ts.getPrice()))
                .collect(Collectors.toList());

        return new FieldDetailResponse(
                field.getId(), field.getName(), field.getType(),
                field.getCoverImage(), field.getStatus(), timeSlotResponses
        );
    }

    @Override
        public List<TimeSlotAvailabilityResponse> getFieldAvailability(String id, LocalDate date) {
            Field field = fieldRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Field not found with id: " + id));

            List<Booking> bookings = bookingRepository.findByFieldIdAndBookingDate(id, date);

            Set<String> bookedSlotIds = bookings.stream()
                    .filter(b -> b.getStatus() != Enums.BookingStatus.CANCELLED)
                    .map(Booking::getTimeSlotId)
                    .collect(Collectors.toSet());

            return field.getTimeSlots().stream()
                    .map(ts -> new TimeSlotAvailabilityResponse(
                            ts.getId(), ts.getStartTime(), ts.getEndTime(), ts.getPrice(),
                            !bookedSlotIds.contains(ts.getId())
                    ))
                    .collect(Collectors.toList());
        }
    }
