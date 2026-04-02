package com.example.backend.service.impl;

import com.example.backend.dto.request.MessageCreateRequest;
import com.example.backend.dto.response.MessageResponse;
import com.example.backend.entity.Conversation;
import com.example.backend.entity.Message;
import com.example.backend.mapper.MessageMapper;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;

    // 👉 Tiêm công cụ Loa Phóng Thanh (WebSocket) của Spring Boot vào đây
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(String conversationId, String currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Phòng chat không tồn tại"));

        boolean isMember = conversation.getMembers().stream()
                .anyMatch(member -> member.getUserId().equals(currentUserId));

        if (!isMember) {
            log.warn("CẢNH BÁO BẢO MẬT: User {} truy cập trái phép", currentUserId);
            throw new RuntimeException("Lỗi bảo mật: Bạn không phải thành viên của cuộc trò chuyện này!");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(messageMapper::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageResponse createMessage(String conversationId, String currentUserId, MessageCreateRequest request) {
        // 1. Kiểm tra phòng chat có thật không
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Phòng chat không tồn tại"));

        // 2. Chốt chặn an ninh: Mày có quyền nhắn vào phòng này không?
        boolean isMember = conversation.getMembers().stream()
                .anyMatch(member -> member.getUserId().equals(currentUserId));
        if (!isMember) {
            log.warn("CẢNH BÁO: User {} cố gắng nhắn tin lậu vào phòng {}", currentUserId, conversationId);
            throw new RuntimeException("Lỗi bảo mật: Bạn không được phép nhắn tin vào phòng này!");
        }

        // 3. Đúc dữ liệu từ Request sang Entity
        Message message = messageMapper.toEntity(request);

        // 4. GHI ĐÈ DỮ LIỆU CHUẨN: Bỏ qua những gì Frontend gửi, tự set các thông tin quan trọng
        message.setConversationId(conversationId);
        message.setSenderId(currentUserId);
        message.setCreatedAt(LocalDateTime.now()); // Lấy thời gian thực tế của Server

        // 5. Lưu xuống Database
        Message savedMessage = messageRepository.save(message);

        // 6. Đúc Entity vừa lưu thành Khuôn Response
        MessageResponse response = messageMapper.toMessageResponse(savedMessage);

        // =========================================================
        // 🚀 BƯỚC 7: BẮN SOCKET THÔNG BÁO CHO CÁC THÀNH VIÊN KHÁC
        // =========================================================
        String destination = "/topic/conversations/" + conversationId;
        messagingTemplate.convertAndSend(destination, response);
        log.info("📢 Đã bắn WebSocket event [receiveMessage] vào kênh: {}", destination);

        // 8. Trả kết quả về cho cái đứa vừa gọi API POST để nó biết là gửi thành công
        return response;
    }
}