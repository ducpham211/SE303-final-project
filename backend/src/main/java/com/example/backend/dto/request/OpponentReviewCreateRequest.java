package com.example.backend.dto.request;
import com.example.backend.utils.Enums;
import lombok.Data;

@Data
public class OpponentReviewCreateRequest {
    private String matchId;
    private String revieweeId; // ID đối thủ bị đánh giá
    private Enums.OpponentRatingType ratingType; // GOOD (+5), NO_SHOW (-10), BAD_BEHAVIOR (-15)
    private String comment;
    private String imageUrl;
}