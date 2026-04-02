package com.example.backend.mapper;

import com.example.backend.dto.request.ConversationMemberCreateRequest;
import com.example.backend.dto.response.ConversationMemberResponse;
import com.example.backend.entity.ConversationMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)

public interface ConversationMemberMapper {
    ConversationMember toEntity(ConversationMemberCreateRequest request);
    ConversationMemberResponse toResponse(ConversationMember conversationMember);
}
