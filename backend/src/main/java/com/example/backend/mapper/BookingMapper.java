package com.example.backend.mapper;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface BookingMapper {

    @Mapping(target = "id", ignore = true)
    Booking toEntity(BookingCreateRequest request);
    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "message", source = "message")
    BookingResponse toResponse(Booking booking, String message);
}