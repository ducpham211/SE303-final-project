package com.example.backend.mapper;

import com.example.backend.dto.request.MessageCreateRequest;
import com.example.backend.dto.response.MessageResponse;
import com.example.backend.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface MessageMapper {

    // 1. Ánh xạ từ Entity ra Response
    @Mapping(target = "conversationId", source = "conversationId")
    @Mapping(target = "senderName", source = "sender.fullName") 
    MessageResponse toMessageResponse(Message entity);

    // 2. Ánh xạ từ Request vào Entity
    Message toEntity(MessageCreateRequest request);
}