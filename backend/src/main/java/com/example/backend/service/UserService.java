package com.example.backend.service;

import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    public UserResponse createUser(UserResponse userResponse) {
        User user = convertToEntity(userResponse);
        user = userRepository.save(user);
        return convertToDTO(user);
    }

    private UserResponse convertToDTO(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getPhone());
    }

    private User convertToEntity(UserResponse userResponse) {
        User user = new User();
        user.setEmail(userResponse.getEmail());
        user.setFullName(userResponse.getFullName());
        user.setPhone(userResponse.getPhone());
        // Set other fields as needed
        return user;
    }
}
