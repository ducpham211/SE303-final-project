package com.example.backend.service.impl;

import com.example.backend.dto.request.AuthRequest;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class AuthServiceImpl implements AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public AuthResponse register(AuthRequest request) {
        String url = supabaseUrl + "/auth/v1/signup";
        HttpEntity<AuthRequest> entity = new HttpEntity<>(request, createHeaders());

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return new AuthResponse(null, "Đăng ký thành công! Vui lòng kiểm tra email (nếu có yêu cầu xác thực).");
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Lỗi đăng ký: " + e.getResponseBodyAsString());
        }
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";
        HttpEntity<AuthRequest> entity = new HttpEntity<>(request, createHeaders());

        // Nếu gọi RestTemplate lỗi, nó sẽ tự văng HttpClientErrorException
        // -> bay thẳng ra GlobalExceptionHandler tóm lấy.
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        return new AuthResponse(response.getBody(), "Đăng nhập thành công!");
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseKey);
        return headers;
    }
}