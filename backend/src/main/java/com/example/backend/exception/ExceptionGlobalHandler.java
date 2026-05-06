package com.example.backend.exception;
import com.example.backend.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;

@RestControllerAdvice
public class ExceptionGlobalHandler {

    // 1. Bắt lỗi nghiệp vụ chung do mình tự ném ra (AppException)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getStatusCode(), ex.getMessage());
        return ResponseEntity.status(ex.getStatusCode()).body(errorResponse);
    }

    // 2. Bắt lỗi riêng từ Supabase (Khi RestTemplate gọi API thất bại)
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<ErrorResponse> handleSupabaseException(HttpClientErrorException ex) {
        // Có thể bóc tách mã lỗi chi tiết của Supabase ở đây nếu muốn
        ErrorResponse errorResponse = new ErrorResponse(ex.getStatusCode().value(), "Lỗi từ máy chủ xác thực: " + ex.getResponseBodyAsString());
        return ResponseEntity.status(ex.getStatusCode()).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        // Log lỗi thật ra console để dev debug (Enterprise standard)
        ex.printStackTrace(); 
        
        // Trả về UI cục lỗi an toàn
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(), 
            "Hệ thống đang bảo trì hoặc có trục trặc nhỏ. Vui lòng thử lại sau!"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}