package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.TokenUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class FairplayInterceptor implements HandlerInterceptor {
    private final UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        // Chỉ chặn thao tác POST (tạo bài ghép trận/xin ghép trận)
        if ("POST".equalsIgnoreCase(method) && 
           (uri.startsWith("/api/match-posts") || uri.startsWith("/api/match-requests"))) {

            String userId;
            try {
                userId = TokenUtils.getCurrentUserId();
            } catch (Exception e) {
                return true; 
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getTrustScore() != null && user.getTrustScore() < 60) {
                throw new AppException(403, "ĐIỂM UY TÍN DƯỚI 60 (" + user.getTrustScore() + "đ). Bạn bị Tòa Án Fairplay cấm ghép trận.");
            }
        }
        return true;
    }
}