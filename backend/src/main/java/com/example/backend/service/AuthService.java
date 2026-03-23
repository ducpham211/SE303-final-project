package com.example.backend.service;

import com.example.backend.dto.request.AuthRequest;
import com.example.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(AuthRequest request);
    AuthResponse login(AuthRequest request);
}