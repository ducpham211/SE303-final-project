package com.example.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class FairplayDecisionRequest {
    
    @JsonProperty("isAccepted")
    private boolean isAccepted; 

    private Integer pointsApplied;
}