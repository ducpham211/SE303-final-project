package com.example.backend.service.impl;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.request.UserCreateRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.User;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.NotificationService;
import com.example.backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.backend.exception.AppException;

@AllArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final UserMapper userMapper;
    @Override
    public UserResponse getUserById(String id) {
        User response = userRepository.findById(id).orElseThrow(() -> new AppException(404, "User not found"));
        return userMapper.toResponse(response);
    }

    @Override
    public UserResponse createUser(String userId, UserCreateRequest request) {
        User user = userMapper.toEntity(request);
        User userSaved = userRepository.save(user);
        NotificationCreateRequest notifRequest = new NotificationCreateRequest();
        notifRequest.setTitle("Đặt sân thành công!");
        notifRequest.setContent("Bạn đã đặt thành công Sân 1 vào lúc 19:00 ngày mai. Vui lòng đến trước 10 phút.");
        notifRequest.setType(Enums.NotificationType.USER_UPDATE); // Dùng Enum để phân loại màu sắc icon trên app
        notificationService.createAndSendNotification(userId, notifRequest);
        return userMapper.toResponse(userSaved);
    }

    @Override
    public UserResponse updateUser(String userId, UserCreateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(404, "User not found"));
        userMapper.updateEntityFromRequest(request, user);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

}