package com.example.backend.service;

import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.entity.Team;

import java.util.List;

public interface TeamService {
    TeamResponse createTeam (String userId, TeamCreateRequest request);
    TeamResponse updateTeam (String teamId, TeamCreateRequest request);
    List<TeamResponse> getMyTeams(String userId);
    void deleteTeam(String teamId, String userId);
}
