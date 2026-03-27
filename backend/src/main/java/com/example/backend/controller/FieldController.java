package com.example.backend.controller;
import com.example.backend.dto.request.FieldCreateRequest;
import com.example.backend.dto.request.FieldUpdateRequest;
import com.example.backend.dto.response.FieldDetailResponse;
import com.example.backend.dto.response.FieldResponse;
import com.example.backend.dto.response.TimeSlotAvailabilityResponse;
import com.example.backend.dto.response.TimeSlotResponse;
import com.example.backend.dto.request.TimeSlotCreateRequest;
import com.example.backend.dto.request.TimeSlotUpdateRequest;
import com.example.backend.entity.Enums;
import com.example.backend.service.FieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
@RestController
@RequestMapping("/api/fields")
public class FieldController {

    private final FieldService fieldService;

    @Autowired
    public FieldController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    @GetMapping
    public ResponseEntity<List<FieldResponse>> getFields(
            @RequestParam(required = false) Enums.FieldType type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(fieldService.getFields(type, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFieldById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(fieldService.getFieldById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<?> getFieldAvailability(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            return ResponseEntity.ok(fieldService.getFieldAvailability(id, date));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<FieldResponse> createField(@RequestBody FieldCreateRequest request){
        FieldResponse fieldCreated = fieldService.createField(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(fieldCreated);
    }

    @PostMapping("/{id}/time-slots")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<TimeSlotResponse> createTimeSlot(
            @PathVariable String id,
            @RequestBody TimeSlotCreateRequest request) {
        TimeSlotResponse response = fieldService.createTimeSlot(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<FieldResponse> updateField(
            @PathVariable String id,
            @RequestBody FieldUpdateRequest request) {
        FieldResponse updatedField = fieldService.updateField(id, request);
        return ResponseEntity.ok(updatedField);
    }

    @PutMapping("/{id}/time-slots/{slotId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<TimeSlotResponse> updateTimeSlot(
            @PathVariable("id") String id,
            @PathVariable("slotId") String slotId,
            @RequestBody TimeSlotUpdateRequest request) {
        TimeSlotResponse response = fieldService.updateTimeSlot(id, slotId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<FieldResponse> deleteField(@PathVariable String id) {
        FieldResponse deletedField = fieldService.deleteField(id);
        return ResponseEntity.ok(deletedField);
    }

    @DeleteMapping("/{id}/time-slots/{slotId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<TimeSlotResponse> deleteTimeSlot(
            @PathVariable("id") String id,
            @PathVariable("slotId") String slotId) {
        TimeSlotResponse response = fieldService.deleteTimeSlot(id, slotId);
        return ResponseEntity.ok(response);
    }
}
