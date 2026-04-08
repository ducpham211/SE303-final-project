package com.example.backend.dto.request;

import com.example.backend.utils.Enums;
import lombok.Data;

@Data
public class MatchRequestStatusCreateRequest {
    private Enums.RequestStatus status;
}
