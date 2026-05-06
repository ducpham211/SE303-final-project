package com.example.backend.mapper;

import com.example.backend.dto.request.PaymentCreateRequest;
import com.example.backend.dto.response.PaymentResponse;
import com.example.backend.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface PaymentMapper {
    @Mapping(target = "id", ignore = true)
    PaymentResponse toResponse(PaymentResponse request);
    Payment createPaymentEntity(PaymentCreateRequest request);
}
