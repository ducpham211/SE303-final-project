// dto/request/ReviewCreateRequest.java
package com.example.backend.dto.request;

import lombok.Data;

@Data
public class ReviewCreateRequest {
    // KHÔNG CÓ reviewerId ở đây để bảo mật
    private String revieweeId;      // ID người bị đánh giá (Đội trưởng đối thủ)
    private String matchRequestId;  // ID của trận đấu (Match Request)
    private String reason;          // Nội dung review mà khách hàng gõ
}