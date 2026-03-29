package com.example.backend.mapper;

import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.entity.MatchPost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface MatchPostMapper {
    @Mapping(target = "id", ignore = true)

    MatchPost toEntity(MatchPostCreateRequest request);
    MatchPostResponse toResponse(MatchPost matchPost);
}
