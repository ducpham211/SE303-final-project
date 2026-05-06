package com.example.backend.mapper;

import com.example.backend.dto.request.TimeSlotCreateRequest;
import com.example.backend.dto.request.TimeSlotUpdateRequest;
import com.example.backend.dto.response.TimeSlotResponse;
import com.example.backend.entity.TimeSlot;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)public interface TimeSlotMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fieldId", ignore = true)

    TimeSlot toEntity(TimeSlotCreateRequest request);
    TimeSlotResponse toResponse(TimeSlot timeSlot);
    void updateEntityFromRequest(TimeSlotUpdateRequest request, @MappingTarget TimeSlot timeSlot);
}
