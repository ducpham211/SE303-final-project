package com.example.backend.dto.request;

import lombok.Data;

@Data
public class ReviewCreateRequest {
    private String bookingId;
    private String fieldId;
    private Integer rating;
    private String comment;
    private String imageUrl;
}