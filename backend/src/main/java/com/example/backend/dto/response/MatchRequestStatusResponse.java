package com.example.backend.dto.response;

import com.example.backend.utils.Enums;
import lombok.Data;

@Data
public class MatchRequestStatusResponse {
    private String id;
    private String postId;
    private String requesterId;
    private Enums.RequestStatus status;
    private String message;
    private String conversationId; // Trả về ID phòng chat nếu ACCEPTED, còn REJECTED thì để null
}