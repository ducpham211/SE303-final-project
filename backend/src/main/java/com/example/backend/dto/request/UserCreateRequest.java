package com.example.backend.dto.request;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String password;
    private String fullName;
    private String phone;
}
