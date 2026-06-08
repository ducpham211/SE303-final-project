package com.example.backend.service.impl;

import com.example.backend.dto.request.AuthRequest;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.utils.Enums;
import com.example.backend.utils.HashUtils;
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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.data.redis.core.StringRedisTemplate;
import jakarta.mail.internet.MimeMessage;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseKey;

    @Value("${supabase.service.role.key}")
    private String supabaseServiceKey;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public void sendRegisterOtp(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new AppException(400, "Email này đã được sử dụng.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set("REG_OTP_" + email, otp, 5, TimeUnit.MINUTES);

        System.out.println("=================================================");
        System.out.println("OTP ĐĂNG KÝ CHO EMAIL " + email + " LÀ: " + otp);
        System.out.println("=================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(senderEmail, "Pitch IE303");
            helper.setTo(email);
            helper.setSubject("Mã OTP Đăng ký tài khoản");
            helper.setText("Mã OTP đăng ký của bạn là: " + otp + ". Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho người khác.");
            
            mailSender.send(message);
        } catch (Exception e) {
            redisTemplate.delete("REG_OTP_" + email);
            throw new AppException(500, "Lỗi khi gửi email: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse register(AuthRequest request) {
        if (request.getOtp() == null || request.getOtp().isEmpty()) {
            throw new AppException(400, "Vui lòng nhập mã OTP");
        }

        String savedOtp = redisTemplate.opsForValue().get("REG_OTP_" + request.getEmail());
        if (savedOtp == null || !savedOtp.equals(request.getOtp())) {
            throw new AppException(400, "OTP không hợp lệ hoặc đã hết hạn");
        }

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
                newUser.setPassword(HashUtils.hashSHA256(request.getPassword()));
                userRepository.save(newUser);
                
                redisTemplate.delete("REG_OTP_" + request.getEmail());
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

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));

            return new AuthResponse(cleanToken, "Đăng nhập thành công!", user.getId(), user.getRole().name());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(400, "Lỗi đăng nhập hoặc sai thông tin tài khoản");
        }
    }

    @Override
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng với email này"));
        
        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set("OTP_" + email, otp, 5, TimeUnit.MINUTES);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(senderEmail, "Pitch IE303");
            helper.setTo(email);
            helper.setSubject("Mã OTP Khôi Phục Mật Khẩu");
            helper.setText("Mã OTP của bạn là: " + otp + ". Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho người khác.");
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new AppException(500, "Lỗi khi gửi email: " + e.getMessage());
        }
    }

    @Override
    public void verifyOtp(String email, String otp) {
        String savedOtp = redisTemplate.opsForValue().get("OTP_" + email);
        if (savedOtp == null || !savedOtp.equals(otp)) {
            throw new AppException(400, "OTP không hợp lệ hoặc đã hết hạn");
        }
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp);
        
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));
        
        String url = supabaseUrl + "/auth/v1/admin/users/" + user.getId();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseServiceKey);
        headers.setBearerAuth(supabaseServiceKey);

        Map<String, String> body = new HashMap<>();
        body.put("password", newPassword);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        try {
            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        } catch (Exception e) {
            throw new AppException(400, "Lỗi đồng bộ mật khẩu lên Supabase Auth: " + e.getMessage());
        }

        user.setPassword(HashUtils.hashSHA256(newPassword));
        userRepository.save(user);
        
        redisTemplate.delete("OTP_" + email);
    }

    @Override
    public String getGoogleAuthUrl(String redirectTo) {
        return supabaseUrl + "/auth/v1/authorize?provider=google&redirect_to=" + redirectTo;
    }

    @Override
    public Map<String, Object> syncGoogleUser(String accessToken) {
        String url = supabaseUrl + "/auth/v1/user";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode userNode = mapper.readTree(response.getBody());

            String userId = userNode.path("id").asText();
            String email = userNode.path("email").asText();
            String fetchedFullName = userNode.path("user_metadata").path("full_name").asText();
            
            if (fetchedFullName == null || fetchedFullName.isEmpty()) {
                fetchedFullName = userNode.path("user_metadata").path("name").asText();
            }
            
            final String finalFullName = (fetchedFullName != null && !fetchedFullName.isEmpty()) ? fetchedFullName : "Người dùng Google";

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setId(userId);
                newUser.setEmail(email);
                newUser.setFullName(finalFullName);
                newUser.setRole(Enums.UserRole.PLAYER);
                return userRepository.save(newUser);
            });

            Map<String, Object> result = new HashMap<>();
            result.put("accessToken", accessToken);
            result.put("userId", user.getId());
            result.put("role", user.getRole().name());
            result.put("email", user.getEmail());
            
            return result;
        } catch (Exception e) {
            throw new AppException(400, "Lỗi đồng bộ thông tin Google: " + e.getMessage());
        }
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseKey);
        return headers;
    }
}