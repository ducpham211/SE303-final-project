package com.example.backend.mapper;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.entity.MatchRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)

public interface MatchRequestMapper {
    @Mapping(target = "id", ignore = true)
    MatchRequest toEntity(MatchRequestCreateRequest matchRequestCreateRequest);
    MatchRequestResponse toResponse(MatchRequest matchRequest);
    void updateEntityFromDto(MatchRequestStatusCreateRequest request, @MappingTarget MatchRequest entity);
    MatchRequestStatusResponse toStatusResponse(MatchRequest entity);
}
