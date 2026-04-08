// mapper/ReviewMapper.java
package com.example.backend.mapper;

import com.example.backend.dto.request.ReviewCreateRequest;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReviewMapper {
    Review toEntity(ReviewCreateRequest request);
    ReviewResponse toResponse(Review review);
}