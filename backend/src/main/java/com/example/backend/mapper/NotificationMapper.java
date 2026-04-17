package com.example.backend.mapper;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.response.NotificationResponse;
import com.example.backend.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)

public interface NotificationMapper {
    NotificationResponse toResponse(Notification notification);
    Notification toEntity(NotificationCreateRequest request);
}
//mapper/NotificationMapper.java