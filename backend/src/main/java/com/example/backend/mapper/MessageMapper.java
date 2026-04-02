package com.example.backend.mapper;

import com.example.backend.dto.request.MessageCreateRequest;
import com.example.backend.dto.response.MessageResponse;
import com.example.backend.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

// Giữ nguyên style @Mapper của bác
@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface MessageMapper {

    // 1. Ánh xạ từ Entity ra Response
    // Phải chỉ rõ cách lấy conversationId từ object conversation bên trong Message Entity
    @Mapping(target = "conversationId", source = "conversationId")
    MessageResponse toMessageResponse(Message entity);

    // 2. Ánh xạ từ Request vào Entity
    Message toEntity(MessageCreateRequest request);
}