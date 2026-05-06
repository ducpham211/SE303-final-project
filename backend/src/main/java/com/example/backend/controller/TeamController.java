package com.example.backend.controller;

import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.TeamService;
import com.example.backend.utils.TokenUtils;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@AllArgsConstructor
public class TeamController {
    private final TeamService teamService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamCreateRequest request) {
        String userId = TokenUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));

        TeamResponse response = teamService.createTeam(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(@PathVariable("id") String teamId,
            @RequestBody TeamCreateRequest request) {
        TeamResponse response = teamService.updateTeam(teamId, request);
        return ResponseEntity.ok(response);
    };

    @GetMapping("/me")
    public ResponseEntity<java.util.List<TeamResponse>> getMyTeams() {
        String userId = TokenUtils.getCurrentUserId();
        return ResponseEntity.ok(teamService.getMyTeams(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTeam(@PathVariable("id") String teamId) {
        String userId = TokenUtils.getCurrentUserId();
        teamService.deleteTeam(teamId, userId);
        return ResponseEntity.ok("Xóa đội thành công!");
    }
}
