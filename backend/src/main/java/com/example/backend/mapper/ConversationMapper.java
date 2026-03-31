package com.example.backend.mapper;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.entity.Conversation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)

public interface ConversationMapper {
    @Mapping(target = "id", ignore = true)
    Conversation toEntity(ConversationCreateRequest request);
    ConversationResponse toResponse(Conversation conversation);
}
