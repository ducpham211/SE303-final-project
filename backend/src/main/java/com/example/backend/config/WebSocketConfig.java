package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 👉 CÁI NHÃN QUAN TRỌNG NHẤT: Bật công tắc tổng cho WebSocket!
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // mở port cho fe
        registry.addEndpoint("/ws") // Đường dẫn Frontend sẽ gọi: ws://localhost:8080/ws
                .setAllowedOriginPatterns("*") // Mở cửa thả ga cho ReactJS gọi chéo domain (CORS)
                .withSockJS(); // Cứu cánh: Nếu trình duyệt cũ cùi bắp không có WebSocket, nó sẽ dùng cách khác để fake Real-time
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 2. Cấu hình
        // /topic: Dùng để chém gió nhóm, bắn cho nhiều người (Ví dụ: /topic/conversations/123)
        // /queue: Dùng để gửi mật thư cho 1 người (Ví dụ thông báo: /queue/notifications)
        registry.enableSimpleBroker("/topic", "/queue");

        // 3. Đường dẫn cho Client gửi tin lên Server qua Socket
        registry.setApplicationDestinationPrefixes("/app");
    }

    // 👉 BỔ SUNG: Cấu hình Graceful Shutdown để không văng lỗi đỏ khi tắt Server lúc đang mở tab web
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setWaitForTasksToCompleteOnShutdown(true); // Bắt Server đợi xử lý nốt tín hiệu ngắt kết nối
        executor.setAwaitTerminationSeconds(5); // Chờ tối đa 5 giây rồi mới sập hẳn
        executor.initialize();
        
        registration.taskExecutor(executor);
    }
}