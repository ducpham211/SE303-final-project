package com.example.backend.utils;

import org.springframework.security.core.context.SecurityContextHolder;

public class TokenUtils {
    public static String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
