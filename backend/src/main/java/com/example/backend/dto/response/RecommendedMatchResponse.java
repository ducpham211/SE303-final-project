package com.example.backend.dto.response;

import lombok.Data;

@Data
public class RecommendedMatchResponse {
    private String matchId;

    // Ghi chú của đội đối thủ (Để Frontend hiện lên cho user tự đọc tham khảo thêm)
    private String opponentNote;

    // Lời giải thích "ngọt ngào" từ Groq AI
    private String aiExplanation;
}