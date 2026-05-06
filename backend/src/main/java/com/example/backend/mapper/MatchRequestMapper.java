package com.example.backend.mapper;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.entity.MatchRequest;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface MatchRequestMapper {
    @Mapping(target = "id", ignore = true)
    MatchRequest toEntity(MatchRequestCreateRequest matchRequestCreateRequest);
    MatchRequestResponse toResponse(MatchRequest matchRequest);
    void updateEntityFromDto(MatchRequestStatusCreateRequest request, @MappingTarget MatchRequest entity);
    MatchRequestStatusResponse toStatusResponse(MatchRequest entity);
}
