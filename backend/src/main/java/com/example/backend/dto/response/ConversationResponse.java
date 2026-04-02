package com.example.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data // 👉 Cái nhãn này cực kỳ quan trọng, nó tự động đẻ ra các hàm setPartnerId(), setLastMessage()...
public class ConversationResponse {
    private String id;
    private String partnerId; // Đón dữ liệu để Frontend biết đang chat với ai
    private String lastMessage; // Đón dữ liệu đoạn tin nhắn xem trước
    private LocalDateTime updatedAt; // Đón thời gian để sắp xếp
}