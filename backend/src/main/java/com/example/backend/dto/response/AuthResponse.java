package com.example.backend.dto.response;

public class AuthResponse {
    private String accessToken;
    private String message;
    private String userId;
    private String role;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String message) {
        this.accessToken = accessToken;
        this.message = message;
    }

    public AuthResponse(String accessToken, String message, String userId, String role) {
        this.accessToken = accessToken;
        this.message = message;
        this.userId = userId;
        this.role = role;
    }

    // Getter và Setter
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}