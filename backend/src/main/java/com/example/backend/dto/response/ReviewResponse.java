// dto/response/ReviewResponse.java
package com.example.backend.dto.response;

import com.example.backend.utils.Enums.ReviewStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private String id;
    private String reviewerId;
    private String revieweeId;
    private String matchRequestId;
    private Integer scoreChange;
    private String reason;
    private Integer aiSuggestedPenalty;
    private ReviewStatus status;
    private LocalDateTime createdAt;
}