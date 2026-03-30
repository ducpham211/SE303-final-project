package com.example.backend.mapper;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.entity.MatchRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)

public interface MatchRequestMapper {
    @Mapping(target = "id", ignore = true)
    MatchRequest toEntity(MatchRequestCreateRequest matchRequestCreateRequest);
    MatchRequestResponse toResponse(MatchRequest matchRequest);
}
