package com.example.backend.service.impl;

import com.example.backend.dto.request.FieldCreateRequest;
import com.example.backend.dto.response.FieldDetailResponse;
import com.example.backend.dto.response.FieldResponse;
import com.example.backend.dto.response.TimeSlotAvailabilityResponse;
import com.example.backend.dto.response.TimeSlotResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Enums;
import com.example.backend.entity.Field;
import com.example.backend.mapper.FieldMapper;
import com.example.backend.mapper.TimeSlotMapper;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.FieldRepository;
import com.example.backend.repository.TimeSlotRepository;
import com.example.backend.service.FieldService;
import com.example.backend.dto.request.FieldUpdateRequest;
import com.example.backend.dto.request.TimeSlotCreateRequest;
import com.example.backend.dto.request.TimeSlotUpdateRequest;
import com.example.backend.entity.TimeSlot;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // thay thế cho constructor
public class FieldServiceImpl implements FieldService {

    private final FieldRepository fieldRepository;
    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final FieldMapper fieldMapper;
    private final TimeSlotMapper timeSlotMapper;

    @Override
    public List<FieldResponse> getFields(Enums.FieldType type, BigDecimal minPrice, BigDecimal maxPrice) {
        List<Field> fields = fieldRepository.findFieldsWithFilters(type, minPrice, maxPrice);
        return fields.stream()
                .map(f -> new FieldResponse(f.getId(), f.getName(), f.getType(), f.getCoverImage()))
                .collect(Collectors.toList());
    }

    @Override
    public FieldDetailResponse getFieldById(String id) {
        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Field not found with id: " + id));

        List<TimeSlotResponse> timeSlotResponses = field.getTimeSlots().stream()
                .map(ts -> new TimeSlotResponse(ts.getId(), ts.getStartTime(), ts.getEndTime(), ts.getPrice(), ts.getStatus()))
                .collect(Collectors.toList());

        return new FieldDetailResponse(
                field.getId(), field.getName(), field.getType(),
                field.getCoverImage(), timeSlotResponses
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
        @Override
        public FieldResponse createField(FieldCreateRequest request) {
            Field field = fieldMapper.toEntity(request);
            Field fieldSaved = fieldRepository.save(field);
            return fieldMapper.toResponse(fieldSaved);
        }

        @Override
        public FieldResponse updateField(String id, FieldUpdateRequest request) {
            Field field = fieldRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Field not found with id: " + id));

            // Dùng Mapper Map DTO -> MappingTarget Entity hiện tại
            fieldMapper.updateEntityFromRequest(request, field);
            Field savedField = fieldRepository.save(field);

            return fieldMapper.toResponse(savedField);
        }

        @Override
        public TimeSlotResponse createTimeSlot(String fieldId, TimeSlotCreateRequest request) {
            Field field = fieldRepository.findById(fieldId)
                    .orElseThrow(() -> new RuntimeException("Field not found with id: " + fieldId));

            TimeSlot timeSlot = timeSlotMapper.toEntity(request);
            timeSlot.setFieldId(fieldId);

            TimeSlot savedTimeSlot = timeSlotRepository.save(timeSlot);

            return timeSlotMapper.toResponse(savedTimeSlot);
        }

        @Override
        public TimeSlotResponse updateTimeSlot(String fieldId, String slotId, TimeSlotUpdateRequest request) {
            // Kiểm tra Field có tồn tại không
            Field field = fieldRepository.findById(fieldId)
                    .orElseThrow(() -> new RuntimeException("Field not found with id: " + fieldId));

            // Kiểm tra TimeSlot có tồn tại không
            TimeSlot timeSlot = timeSlotRepository.findById(slotId)
                    .orElseThrow(() -> new RuntimeException("TimeSlot not found with id: " + slotId));

            // Chặn lỗi bảo mật: Đề phòng ai đó truyền ID của field này nhưng slotId của field khác
            if (!timeSlot.getFieldId().equals(fieldId)) {
                throw new RuntimeException("TimeSlot does not belong to the specified Field");
            }

            timeSlotMapper.updateEntityFromRequest(request, timeSlot);
            TimeSlot savedTimeSlot = timeSlotRepository.save(timeSlot);

            return timeSlotMapper.toResponse(savedTimeSlot);
        }

        @Override
        public FieldResponse deleteField(String id) {
            Field field = fieldRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Field not found with id: " + id));

            fieldRepository.delete(field);
            return fieldMapper.toResponse(field);
        }

        @Override
        public TimeSlotResponse deleteTimeSlot(String fieldId, String slotId) {
            Field field = fieldRepository.findById(fieldId)
                    .orElseThrow(() -> new RuntimeException("Field not found with id: " + fieldId));

            TimeSlot timeSlot = timeSlotRepository.findById(slotId)
                    .orElseThrow(() -> new RuntimeException("TimeSlot not found with id: " + slotId));

            if (!timeSlot.getFieldId().equals(fieldId)) {
                throw new RuntimeException("TimeSlot does not belong to the specified Field");
            }

            timeSlotRepository.delete(timeSlot);
            return timeSlotMapper.toResponse(timeSlot);
        }
    }
