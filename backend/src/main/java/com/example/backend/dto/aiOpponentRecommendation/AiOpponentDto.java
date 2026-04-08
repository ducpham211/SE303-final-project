package com.example.backend.dto.aiOpponentRecommendation;

public class AiOpponentDto {

    private String matchId;
    private String playStyleNote;
    private int trustScore;

    // Constructor mặc định (Bắt buộc cho quá trình khởi tạo của Jackson)
    public AiOpponentDto() {
    }

    // Constructor đầy đủ tham số
    public AiOpponentDto(String matchId, String playStyleNote, int trustScore) {
        this.matchId = matchId;
        this.playStyleNote = playStyleNote;
        this.trustScore = trustScore;
    }

    // Các phương thức Getters (Bắt buộc để Jackson đọc dữ liệu chuyển thành JSON)
    public String getMatchId() {
        return matchId;
    }

    public String getPlayStyleNote() {
        return playStyleNote;
    }

    public int getTrustScore() {
        return trustScore;
    }

    // Các phương thức Setters
    public void setMatchId(String matchId) {
        this.matchId = matchId;
    }

    public void setPlayStyleNote(String playStyleNote) {
        this.playStyleNote = playStyleNote;
    }

    public void setTrustScore(int trustScore) {
        this.trustScore = trustScore;
    }

    // Phương thức toString hỗ trợ kiểm thử và ghi nhật ký hệ thống
    @Override
    public String toString() {
        return "AiOpponentDto{" +
                "matchId='" + matchId + '\'' +
                ", playStyleNote='" + playStyleNote + '\'' +
                ", trustScore=" + trustScore +
                '}';
    }
}