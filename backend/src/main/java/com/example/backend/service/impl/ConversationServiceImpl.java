package com.example.backend.service.impl;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.entity.Conversation;
import com.example.backend.entity.ConversationMember;
import com.example.backend.mapper.ConversationMapper;
import com.example.backend.mapper.MessageMapper;
import com.example.backend.repository.ConversationMemberRepository;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ConversationService;
import com.example.backend.utils.Enums;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor 
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;
    private final ConversationMemberRepository conversationMemberRepository;
    private final MessageMapper messageMapper;
    private final UserRepository userRepository; 

    @Override
    @Transactional(readOnly = true) 
    public List<ConversationResponse> getInbox(String currentUserId) {
        List<Conversation> conversations = conversationRepository.findConversationsByUserId(currentUserId);

        return conversations.stream()
                .map(conv -> {
                    ConversationResponse response = conversationMapper.toConversationResponse(conv, currentUserId);
                    
                    if (conv.getType() == Enums.ConversationType.TEAM) {
                        response.setPartnerName(conv.getName());
                    } else if (response.getPartnerId() != null) {
                        userRepository.findById(response.getPartnerId()).ifPresent(user -> {
                            response.setPartnerName(user.getFullName() != null && !user.getFullName().isEmpty() 
                                    ? user.getFullName() : "Người dùng " + user.getId().substring(0, 6));
                        });
                    }

                    response.setType(conv.getType());
                    response.setName(conv.getName());
                    response.setStatus(conv.getStatus());
                    
                    // TRUYỀN MÃ KÈO XUỐNG FRONTEND
                    response.setMatchId(conv.getMatchId());
                    
                    return response;
                })
                .sorted((c1, c2) -> c2.getUpdatedAt().compareTo(c1.getUpdatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional 
    public ConversationResponse createDirectConversation(ConversationCreateRequest request, String user1Id, String user2Id) {
        Conversation conversation = conversationMapper.toEntity(request);
        conversation.setStatus(Enums.ConversationStatus.ACTIVE);
        
        // GẮN MÃ KÈO
        conversation.setMatchId(request.getMatchId());
        
        Conversation savedConversation = conversationRepository.save(conversation);
        
        ConversationMember member1 = new ConversationMember();
        member1.setConversationId(savedConversation.getId()); 
        member1.setUserId(user1Id);
        ConversationMember member2 = new ConversationMember();
        member2.setConversationId(savedConversation.getId()); 
        member2.setUserId(user2Id);
        conversationMemberRepository.saveAll(java.util.List.of(member1, member2));
        
        return conversationMapper.toResponse(savedConversation);
    }

    @Override
    @Transactional
    public void markConversationsAsCompletedByMatchId(String matchId) {
        if (matchId == null || matchId.isEmpty()) return;
        List<Conversation> convs = conversationRepository.findByMatchId(matchId);
        for (Conversation conv : convs) {
            conv.setStatus(Enums.ConversationStatus.COMPLETED);
        }
        conversationRepository.saveAll(convs);
    }
}