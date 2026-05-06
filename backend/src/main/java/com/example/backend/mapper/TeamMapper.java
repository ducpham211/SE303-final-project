package com.example.backend.mapper;

import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.entity.Team;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TeamMapper {
    @Mapping(target = "id", ignore = true)
    Team toEntity(TeamCreateRequest request);
    TeamResponse toResponse(Team team);
    void updateEntityFromRequest(TeamCreateRequest request, @MappingTarget Team team);
}
