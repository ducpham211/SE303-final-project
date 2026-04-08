package com.example.backend.service;

import com.example.backend.dto.request.UserCreateRequest;
import com.example.backend.dto.response.UserResponse;

public interface UserService {
    UserResponse getUserById(String id);
    UserResponse createUser(String userId, UserCreateRequest request);
    UserResponse updateUser(String userId, UserCreateRequest request);
}
