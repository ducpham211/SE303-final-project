package com.example.backend.service.impl;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.Team;
import com.example.backend.entity.TeamMember;
import com.example.backend.entity.User;
import com.example.backend.entity.Conversation;
import com.example.backend.entity.ConversationMember;
import com.example.backend.mapper.TeamMapper;
import com.example.backend.repository.TeamRepository;
import com.example.backend.repository.TeamMemberRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.repository.ConversationMemberRepository;
import com.example.backend.service.NotificationService;
import com.example.backend.service.TeamService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.backend.exception.AppException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.example.backend.event.BookingNotificationEvent;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;
    private final TeamMapper teamMapper;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    
    // Repository cho hệ thống Chat
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public TeamResponse createTeam(String userId, TeamCreateRequest request) {
        Team team = teamMapper.toEntity(request);
        team.setCaptainId(userId);
        team.setCreatedAt(LocalDateTime.now());
        
        // 1. TẠO NHÓM CHAT TRƯỚC
        Conversation conv = new Conversation();
        conv.setType(Enums.ConversationType.TEAM);
        conv.setName(team.getName()); // Lấy tên đội làm tên nhóm chat
        conv.setCreatedAt(LocalDateTime.now());
        conv = conversationRepository.save(conv);

        // 2. LƯU ĐỘI BÓNG VỚI CONVERSATION_ID
        team.setConversationId(conv.getId());
        team = teamRepository.save(team);
        
        // 3. THÊM ĐỘI TRƯỞNG VÀO NHÓM CHAT
        ConversationMember captainMember = new ConversationMember();
        captainMember.setConversationId(conv.getId());
        captainMember.setUserId(userId);
        conversationMemberRepository.save(captainMember);
        
        // 4. GỬI THÔNG BÁO
        NotificationCreateRequest notifRequest = new NotificationCreateRequest();
        notifRequest.setTitle("Tạo đội bóng thành công");
        notifRequest.setContent("Bạn đã tạo thành công đội bóng " + team.getName() + " và nhóm chat đội.");
        notifRequest.setType(Enums.NotificationType.BOOKING_UPDATE);
        notificationService.createAndSendNotification(userId, notifRequest);
        
        TeamResponse res = teamMapper.toResponse(team);
        res.setIsCaptain(true);
        return res;
    }

    @Override
    public TeamResponse updateTeam(String teamId, String userId, TeamCreateRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(userId)) {
            throw new AppException(403, "Bạn không có quyền cập nhật đội bóng này!");
        }

        teamMapper.updateEntityFromRequest(request, team);
        team = teamRepository.save(team);
        
        // (Tùy chọn) Cập nhật tên nhóm chat nếu tên đội bóng thay đổi
        if (team.getConversationId() != null) {
            Conversation conv = conversationRepository.findById(team.getConversationId()).orElse(null);
            if (conv != null) {
                conv.setName(team.getName());
                conversationRepository.save(conv);
            }
        }
        
        TeamResponse res = teamMapper.toResponse(team);
        res.setIsCaptain(true);
        return res;
    }

    @Override
    public List<TeamResponse> getMyTeams(String userId) {
        // Lấy đội mà mình làm đội trưởng
        List<Team> teamsAsCaptain = teamRepository.findByCaptainId(userId);
        
        // Lấy đội mà mình làm thành viên đã chấp nhận
        List<TeamMember> memberships = teamMemberRepository.findByUserIdAndStatus(userId, "ACCEPTED");
        List<Team> teamsAsMember = memberships.stream()
                .map(TeamMember::getTeam)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Gộp lại và loại bỏ trùng lặp (dùng Set)
        Set<Team> allTeams = new HashSet<>(teamsAsCaptain);
        allTeams.addAll(teamsAsMember);

        return allTeams.stream().map(team -> {
            TeamResponse res = teamMapper.toResponse(team);
            res.setIsCaptain(team.getCaptainId().equals(userId));
            return res;
        }).sorted(Comparator.comparing(TeamResponse::getCreatedAt).reversed())
          .collect(Collectors.toList());
    }

    @Override
    public void deleteTeam(String teamId, String userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(userId)) {
            throw new AppException(403, "Bạn không phải đội trưởng của đội này!");
        }
        
        String conversationId = team.getConversationId();
        
        // Sử dụng bulk delete của JPQL để xóa nhanh qua 1 câu lệnh, tránh N+1 Select/Delete của Hibernate
        teamRepository.deleteTeamById(teamId);
        
        // Xóa nhóm chat bằng bulk delete để tránh Hibernate SELECT
        if (conversationId != null) {
            conversationRepository.deleteConversationById(conversationId);
        }
    }

    @Override
    public List<Map<String, Object>> getTeamMembers(String teamId) {
        return teamMemberRepository.findByTeamId(teamId).stream().map(member -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", member.getId());
            map.put("teamId", member.getTeamId());
            map.put("userId", member.getUserId());
            map.put("status", member.getStatus());
            if (member.getUser() != null) {
                map.put("userName", member.getUser().getFullName());
                map.put("userEmail", member.getUser().getEmail());
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public void inviteMember(String teamId, String captainId, String email) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(captainId)) {
            throw new AppException(403, "Chỉ đội trưởng mới có quyền mời thành viên");
        }

        User userToInvite = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng với email này"));

        if (team.getCaptainId().equals(userToInvite.getId())) {
            throw new AppException(400, "Bạn không thể tự mời chính mình");
        }

        if (teamMemberRepository.findByTeamIdAndUserId(teamId, userToInvite.getId()).isPresent()) {
            throw new AppException(400, "Người dùng này đã ở trong đội hoặc đã được mời");
        }
        User captain = userRepository.findById(captainId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội trưởng"));
        TeamMember member = new TeamMember();
        member.setTeamId(teamId);
        member.setUserId(userToInvite.getId());
        member.setStatus("PENDING");
        member.setCreatedAt(LocalDateTime.now());
        teamMemberRepository.save(member);
        String content = "Bạn đã được mời vào đội " + team.getName() + " bởi " + captain.getFullName();
        eventPublisher.publishEvent(new BookingNotificationEvent(userToInvite.getId(), "Lời mời tham gia đội", content, Enums.NotificationType.TEAM_INVITE));
    }

    @Override
    public void removeMember(String teamId, String captainId, String memberId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(captainId)) {
            throw new AppException(403, "Chỉ đội trưởng mới có quyền xóa thành viên");
        }

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy thành viên"));

        if (!member.getTeamId().equals(teamId)) {
            throw new AppException(400, "Thành viên không thuộc đội này");
        }

        String removedUserId = member.getUserId();
        teamMemberRepository.delete(member); // Xóa khỏi đội bóng
        
        // KICK KHỎI NHÓM CHAT
        if (team.getConversationId() != null) {
            conversationMemberRepository.deleteByConversationIdAndUserId(team.getConversationId(), removedUserId);
        }
    }

    @Override
    public List<Map<String, Object>> getMyInvitations(String userId) {
        return teamMemberRepository.findByUserIdAndStatus(userId, "PENDING").stream().map(inv -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inv.getId());
            map.put("teamId", inv.getTeamId());
            if (inv.getTeam() != null) {
                map.put("teamName", inv.getTeam().getName());
                if (inv.getTeam().getCaptain() != null) {
                    map.put("captainName", inv.getTeam().getCaptain().getFullName());
                }
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public void respondToInvitation(String invitationId, String userId, boolean accept) {
        TeamMember invitation = teamMemberRepository.findById(invitationId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy lời mời"));

        if (!invitation.getUserId().equals(userId)) {
            throw new AppException(403, "Bạn không có quyền thao tác trên lời mời này");
        }

        if (accept) {
            invitation.setStatus("ACCEPTED");
            teamMemberRepository.save(invitation);
            
            // THÊM VÀO NHÓM CHAT
            Team team = teamRepository.findById(invitation.getTeamId())
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
            
            if (team.getConversationId() != null) {
                Conversation conv = conversationRepository.findById(team.getConversationId())
                        .orElseThrow(() -> new AppException(404, "Không tìm thấy nhóm chat"));
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));
                
                ConversationMember newMember = new ConversationMember();
                newMember.setConversationId(conv.getId());
                newMember.setUserId(userId);
                newMember.setConversation(conv);
                newMember.setUser(user);
                conversationMemberRepository.save(newMember);
            }
        } else {
            teamMemberRepository.delete(invitation);
        }
    }
}
