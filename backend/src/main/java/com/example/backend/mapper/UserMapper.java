package com.example.backend.mapper;

import com.example.backend.dto.request.UserCreateRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {
    void updateEntityFromRequest(UserCreateRequest request, @MappingTarget User user);
    User toEntity(UserCreateRequest request);
    UserResponse toResponse(User user);
}
