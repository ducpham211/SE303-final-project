package com.example.backend.dto.response;

public class AuthResponse {
    private String accessToken;
    private String message;

    public AuthResponse(String accessToken, String message) {
        this.accessToken = accessToken;
        this.message = message;
    }

    // Getter và Setter
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}