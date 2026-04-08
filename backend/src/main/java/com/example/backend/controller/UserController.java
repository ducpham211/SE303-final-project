package com.example.backend.controller;

import com.example.backend.dto.request.UserCreateRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import com.example.backend.utils.TokenUtils;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        String userId = TokenUtils.getCurrentUserId();
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable("id") String userId,
            @RequestBody UserCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }
}