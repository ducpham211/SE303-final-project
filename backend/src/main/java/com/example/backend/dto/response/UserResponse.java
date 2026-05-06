package com.example.backend.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
}