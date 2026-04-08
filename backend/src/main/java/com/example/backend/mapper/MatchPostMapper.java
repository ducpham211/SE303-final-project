package com.example.backend.mapper;

import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.entity.MatchPost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE, uses = {MatchRequestMapper.class}, nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE )
public interface MatchPostMapper {
    @Mapping(target = "id", ignore = true)
    MatchPost toEntity(MatchPostCreateRequest request);
    void updateEntityFromRequest(MatchPostCreateRequest request, @MappingTarget MatchPost matchPost);
    MatchPostResponse toResponse(MatchPost matchPost);
}