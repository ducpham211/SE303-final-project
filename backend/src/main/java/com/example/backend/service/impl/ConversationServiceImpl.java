package com.example.backend.service.impl;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.entity.Conversation;
import com.example.backend.entity.ConversationMember;
import com.example.backend.mapper.ConversationMapper;
import com.example.backend.mapper.MessageMapper;
import com.example.backend.repository.ConversationMemberRepository;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor // Sửa @Data thành @RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;
    private final ConversationMemberRepository conversationMemberRepository;
    private final MessageMapper messageMapper;

    @Override
    @Transactional(readOnly = true) // BẮT BUỘC: Để JPA chịu khó load list members và messages
    public List<ConversationResponse> getInbox(String currentUserId) {
        List<Conversation> conversations = conversationRepository.findConversationsByUserId(currentUserId);

        return conversations.stream()
                .map(conv -> conversationMapper.toConversationResponse(conv, currentUserId))
                // Xếp phòng chat có tin nhắn mới nhất lên trên cùng (giống Zalo/Messenger)
                .sorted((c1, c2) -> c2.getUpdatedAt().compareTo(c1.getUpdatedAt()))
                .collect(Collectors.toList());
    }
    @Override
    @Transactional // Bắt buộc phải có vì ta lưu vào 2 bảng khác nhau
    public ConversationResponse createDirectConversation(ConversationCreateRequest request, String user1Id, String user2Id) {
        // 1. Dùng Mapper biến Request DTO thành Entity
        Conversation conversation = conversationMapper.toEntity(request);

        // 2. LƯU PHÒNG CHAT TRƯỚC để lấy ID
        Conversation savedConversation = conversationRepository.save(conversation);
        // 3. Khởi tạo thủ công Member 1 (Phải dùng chữ 'new')
        ConversationMember member1 = new ConversationMember();
        member1.setConversationId(savedConversation.getId()); // Liên kết khóa ngoại với phòng chat vừa tạo
        member1.setUserId(user1Id);
        conversationMemberRepository.save(member1);

        // 4. Khởi tạo thủ công Member 2
        ConversationMember member2 = new ConversationMember();
        member2.setConversationId(savedConversation.getId()); // Liên kết khóa ngoại với phòng chat vừa tạo
        member2.setUserId(user2Id);
        conversationMemberRepository.save(member2);
        // 5. Trả về Response
        return conversationMapper.toResponse(savedConversation);
    }


}