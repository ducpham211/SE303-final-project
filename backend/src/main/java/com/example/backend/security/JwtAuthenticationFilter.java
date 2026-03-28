package com.example.backend.security;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    // 👉 1. Gọi UserRepository vào để có đồ nghề chui xuống DB
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                // 👉 THỦ THUẬT NINJA: Bóc token bằng Base64 để né lỗi ES256 của JJWT
                String[] chunks = jwt.split("\\.");
                if (chunks.length == 3) { // Token chuẩn luôn có 3 phần
                    // Giải mã phần Payload (phần ở giữa)
                    String payload = new String(java.util.Base64.getUrlDecoder().decode(chunks[1]));

                    // Dùng búa Jackson đập cục JSON ra để lấy chữ "sub" (chính là userId)
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(payload);

// In ra để bắt tận tay xem ruột Token chứa chữ gì
                    System.out.println("==== RUỘT TOKEN ==== : " + payload);

                    String userId = null;
                    if (jsonNode.has("sub")) {
                        userId = jsonNode.get("sub").asText();
                    } else if (jsonNode.has("id")) {
                        userId = jsonNode.get("id").asText();
                    } else if (jsonNode.has("userId")) {
                        userId = jsonNode.get("userId").asText();
                    } else if (jsonNode.has("username")) {
                        userId = jsonNode.get("username").asText();
                    }

                    if (userId == null) {
                        logger.error("Token không hợp lệ: Không tìm thấy trường chứa ID người dùng!");
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // 👉 Code tìm User trong Database của bác giữ nguyên
                    Optional<User> userOptional = userRepository.findById(userId);

                    if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        String roleName = "ROLE_" + user.getRole().toString();

                        List<GrantedAuthority> authorities = new ArrayList<>();
                        authorities.add(new SimpleGrantedAuthority(roleName));

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userId, null, authorities);

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Can not set up for user: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    private boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (Exception e) {
            logger.error("Token JWT invalid: " + e.getMessage());
        }
        return false;
    }
}