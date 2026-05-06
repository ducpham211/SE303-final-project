package com.example.backend.mapper;

import com.example.backend.dto.request.FieldCreateRequest;
import com.example.backend.dto.request.FieldUpdateRequest;
import com.example.backend.dto.response.FieldResponse;
import com.example.backend.entity.Field;
import org.mapstruct.*;

// componentModel = "spring" giúp bác có thể @Autowired cái mapper này vào Service
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)public interface FieldMapper {

    // 1. Map từ DTO (Request) sang Entity để lưu DB
    @Mapping(target = "id", ignore = true) // Bỏ qua ID vì lúc tạo mới chưa có ID
    // Có thể thêm ignore các trường khác như timeSlots, bookings... nếu entity của bác có
    Field toEntity(FieldCreateRequest request);

    // 2. Map từ Entity sang DTO (Response) để trả về Front-end
    FieldResponse toResponse(Field field);

    // 3. Cập nhật Entity từ DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "timeSlots", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    void updateEntityFromRequest(FieldUpdateRequest request, @MappingTarget Field field);
}