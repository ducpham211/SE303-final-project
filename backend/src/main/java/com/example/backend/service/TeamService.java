package com.example.backend.service;

import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import java.util.List;
import java.util.Map;

public interface TeamService {
    TeamResponse createTeam(String userId, TeamCreateRequest request);
    TeamResponse updateTeam(String teamId, String userId, TeamCreateRequest request);
    List<TeamResponse> getMyTeams(String userId);
    void deleteTeam(String teamId, String userId);
    
    List<Map<String, Object>> getTeamMembers(String teamId);
    void inviteMember(String teamId, String captainId, String email);
    void removeMember(String teamId, String captainId, String memberId);
    List<Map<String, Object>> getMyInvitations(String userId);
    void respondToInvitation(String invitationId, String userId, boolean accept);
}