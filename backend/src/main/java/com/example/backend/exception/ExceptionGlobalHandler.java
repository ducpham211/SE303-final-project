package com.example.backend.exception;
import com.example.backend.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;

@RestControllerAdvice(basePackages = "com.example.backend.controller")
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

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.FORBIDDEN.value(), "Bạn không có quyền thực hiện hành động này.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        // Log lỗi thật ra console để dev debug (Enterprise standard)
        ex.printStackTrace(); 
        
        String detailMessage = ex.getClass().getName() + ": " + ex.getMessage();
        if (ex.getStackTrace() != null && ex.getStackTrace().length > 0) {
            detailMessage += " at " + ex.getStackTrace()[0].toString();
        }
        // Trả về UI cục lỗi an toàn
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(), 
            detailMessage
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}