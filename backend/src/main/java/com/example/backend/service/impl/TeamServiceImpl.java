package com.example.backend.service.impl;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.Team;
import com.example.backend.mapper.TeamMapper;
import com.example.backend.repository.TeamRepository;
import com.example.backend.service.NotificationService;
import com.example.backend.service.TeamService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.backend.exception.AppException;
import java.util.List;

@Service
@AllArgsConstructor
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;
    private final TeamMapper teamMapper;
    private final NotificationService notificationService;
    @Override
    public TeamResponse createTeam(String userId, TeamCreateRequest request){
        Team team = teamMapper.toEntity(request);
        team = teamRepository.save(team);
        NotificationCreateRequest notifRequest = new NotificationCreateRequest();
        notifRequest.setTitle("🎉 Tạo đội bóng thành công");
        String content = "Bạn đã tạo thành công đội bóng "+team.getName();
        notifRequest.setContent(content);
        notifRequest.setType(Enums.NotificationType.BOOKING_UPDATE);
        notificationService.createAndSendNotification(userId, notifRequest);
        return teamMapper.toResponse(team);
    }
    @Override
    public TeamResponse updateTeam(String teamId, TeamCreateRequest request){
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        teamMapper.updateEntityFromRequest(request, team);
        team = teamRepository.save(team);
        return teamMapper.toResponse(team);
    }
    @Override
    public List<TeamResponse> getMyTeams(String userId) {
        List<Team> teams = teamRepository.findByCaptainId(userId);
        return teams.stream()
                .map(teamMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void deleteTeam(String teamId, String userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(userId)) {
            throw new AppException(403, "Bạn không phải đội trưởng của đội này!");
        }
        
        teamRepository.delete(team);
    }
}
