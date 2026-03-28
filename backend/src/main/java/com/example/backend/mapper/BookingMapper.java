package com.example.backend.mapper;

import com.example.backend.dto.request.BookingCreateRequest;
import com.example.backend.dto.response.BookingResponse;
import com.example.backend.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface BookingMapper {

    // 1. Map từ DTO sang Entity (Phòng trường hợp bác cần dùng sau này)
    @Mapping(target = "id", ignore = true)
    Booking toEntity(BookingCreateRequest request);

    // 2. Map từ Entity sang Response (Có kèm theo tham số message)
    // MapStruct cực thông minh, nó biết lấy ID từ booking và message từ tham số thứ 2
    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "message", source = "message")
    BookingResponse toResponse(Booking booking, String message);
}