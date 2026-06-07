package com.example.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private String id;
    private String fieldId;
    private String bookingId;
    private String userId;
    
    // Các trường bắt buộc phải có cho Đánh giá sân
    private Integer rating;
    private String comment;
    private String imageUrl;
    private LocalDateTime createdAt;
    
    // MapStruct sẽ tự động lấy thông tin từ Entity User map vào đây
    private UserResponse user; 
}