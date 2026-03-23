package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        // Lấy ID của user từ token đã được giải mã trong JwtAuthenticationFilter
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Nếu qua được đến đây nghĩa là Token xịn, trả về kết quả
        return ResponseEntity.ok("Verify successfully: " + userId);
    }
}