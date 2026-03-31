package com.example.backend.mapper;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.entity.Conversation;
import com.example.backend.entity.ConversationMember;
import com.example.backend.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.util.Comparator;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)

public interface ConversationMapper {
    @Mapping(target = "id", ignore = true)
    default ConversationResponse toConversationResponse(Conversation entity, String currentUserId) {
        if (entity == null) {
            return null;
        }

        // Lấy ID người chat cùng
        String partnerId = null;
        if (entity.getMembers() != null) {
            partnerId = entity.getMembers().stream()
                    .map(ConversationMember::getUserId)
                    .filter(id -> !id.equals(currentUserId))
                    .findFirst()
                    .orElse(null);
        }

        // Tìm tin nhắn cuối
        String lastMessageContent = "Chưa có tin nhắn";
        LocalDateTime lastUpdate = entity.getCreatedAt();

        if (entity.getMessages() != null && !entity.getMessages().isEmpty()) {
            Message lastMsg = entity.getMessages().stream()
                    .max(Comparator.comparing(Message::getCreatedAt))
                    .orElse(null);

            if (lastMsg != null) {
                lastMessageContent = lastMsg.getContent();
                lastUpdate = lastMsg.getCreatedAt();
            }
        }

        // ==========================================
        // DÙNG SETTER TRUYỀN THỐNG ĐỂ ĐỒNG BỘ STYLE
        // ==========================================
        ConversationResponse response = new ConversationResponse();
        response.setId(entity.getId());

        // Lưu ý nhỏ: Lúc nãy ở code bác gửi là `.senderId(partnerId)`,
        // Nếu trong file ConversationResponse.java bác đang dùng biến tên là partnerId thì để là setPartnerId nhé.
        // Còn nếu bác đã đổi tên biến thành senderId thì sửa lại thành: response.setSenderId(partnerId);
        response.setPartnerId(partnerId);

        response.setLastMessage(lastMessageContent);
        response.setUpdatedAt(lastUpdate);

        return response;
    }
    Conversation toEntity(ConversationCreateRequest request);
    ConversationResponse toResponse(Conversation conversation);
}
