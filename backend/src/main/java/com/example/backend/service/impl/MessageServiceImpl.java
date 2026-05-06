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
import com.example.backend.exception.AppException;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final NotificationServiceImpl notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(String conversationId, String currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(404, "Phòng trò chuyện không tồn tại"));

        boolean isMember = conversation.getMembers().stream()
                .anyMatch(member -> member.getUserId().equals(currentUserId));

        if (!isMember) {
            log.warn("CẢNH BÁO BẢO MẬT: Người dùng {} truy cập trái phép", currentUserId);
            throw new AppException(403, "Lỗi bảo mật: Cá nhân không thuộc cuộc trò chuyện này");
        }

        // Tích hợp Redis: Đặt lại bộ đếm tin nhắn chưa đọc khi người dùng mở phòng trò chuyện
        notificationService.resetUnreadCount(currentUserId, conversationId);

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(messageMapper::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageResponse createMessage(String conversationId, String currentUserId, MessageCreateRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(404, "Phòng trò chuyện không tồn tại"));

        boolean isMember = conversation.getMembers().stream()
                .anyMatch(member -> member.getUserId().equals(currentUserId));

        if (!isMember) {
            log.warn("CẢNH BÁO: Người dùng {} thao tác trái phép tại phòng {}", currentUserId, conversationId);
            throw new AppException(403, "Lỗi bảo mật: Hành vi bị từ chối");
        }

        Message message = messageMapper.toEntity(request);
        message.setConversationId(conversationId);
        message.setSenderId(currentUserId);
        message.setCreatedAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);
        MessageResponse response = messageMapper.toMessageResponse(savedMessage);

        String destination = "/topic/conversations/" + conversationId;
        messagingTemplate.convertAndSend(destination, response);
        log.info("Phát sóng sự kiện WebSocket đến kênh: {}", destination);

        // Tích hợp Redis: Gia tăng bộ đếm cho các thành viên khác trong phòng
        conversation.getMembers().forEach(member -> {
            if (!member.getUserId().equals(currentUserId)) {
                notificationService.incrementUnreadCount(member.getUserId(), conversationId);
            }
        });

        return response;
    }
}