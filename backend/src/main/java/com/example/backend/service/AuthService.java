package com.example.backend.service;

import com.example.backend.dto.request.AuthRequest;
import com.example.backend.dto.response.AuthResponse;

import java.util.Map;

public interface AuthService {
    AuthResponse register(AuthRequest request);
    AuthResponse login(AuthRequest request);
    void forgotPassword(String email);
    void sendRegisterOtp(String email);
    void verifyOtp(String email, String otp);
    void resetPassword(String email, String otp, String newPassword);
    String getGoogleAuthUrl(String redirectTo);
    Map<String, Object> syncGoogleUser(String accessToken);
}