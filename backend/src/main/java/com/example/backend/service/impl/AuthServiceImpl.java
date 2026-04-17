package com.example.backend.service.impl;

import com.example.backend.dto.request.AuthRequest;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import com.example.backend.exception.AppException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AuthServiceImpl implements AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private UserRepository userRepository;

    @Override
    public AuthResponse register(AuthRequest request) {
        String url = supabaseUrl + "/auth/v1/signup";
        HttpEntity<AuthRequest> entity = new HttpEntity<>(request, createHeaders());

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response.getBody());
            
            String userId = null;
            if (rootNode.has("id")) {
                userId = rootNode.get("id").asText();
            } else if (rootNode.has("user") && rootNode.get("user").has("id")) {
                userId = rootNode.get("user").get("id").asText();
            }

            if (userId != null) {
                User newUser = new User();
                newUser.setId(userId);
                newUser.setEmail(request.getEmail());
                newUser.setRole(Enums.UserRole.PLAYER);
                newUser.setFullName(request.getFullName());
                newUser.setPassword(request.getPassword());
                userRepository.save(newUser);
            }

            return new AuthResponse(null, "Đăng ký thành công!");
        } catch (Exception e) {
            throw new AppException(400, "Lỗi đăng ký: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";
        HttpEntity<AuthRequest> entity = new HttpEntity<>(request, createHeaders());

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response.getBody());

            String cleanToken = rootNode.path("access_token").asText();

            return new AuthResponse(cleanToken, "Đăng nhập thành công!");
        } catch (Exception e) {
            throw new AppException(400, "Lỗi phân tích token từ Supabase");
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseKey);
        return headers;
    }
}