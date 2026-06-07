package com.example.backend.controller;

import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.service.TeamService;
import com.example.backend.utils.TokenUtils;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@AllArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamCreateRequest request) {
        String userId = TokenUtils.getCurrentUserId();
        return ResponseEntity.ok(teamService.createTeam(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(@PathVariable("id") String teamId,
            @RequestBody TeamCreateRequest request) {
        String userId = TokenUtils.getCurrentUserId();
        return ResponseEntity.ok(teamService.updateTeam(teamId, userId, request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<TeamResponse>> getMyTeams() {
        String userId = TokenUtils.getCurrentUserId();
        return ResponseEntity.ok(teamService.getMyTeams(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTeam(@PathVariable("id") String teamId) {
        String userId = TokenUtils.getCurrentUserId();
        teamService.deleteTeam(teamId, userId);
        return ResponseEntity.ok("Xóa đội thành công!");
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getTeamMembers(@PathVariable("id") String teamId) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId));
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteMember(@PathVariable("id") String teamId, @RequestBody Map<String, String> body) {
        String captainId = TokenUtils.getCurrentUserId();
        teamService.inviteMember(teamId, captainId, body.get("email"));
        return ResponseEntity.ok("Đã mời thành viên");
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable("id") String teamId, @PathVariable("memberId") String memberId) {
        String captainId = TokenUtils.getCurrentUserId();
        teamService.removeMember(teamId, captainId, memberId);
        return ResponseEntity.ok("Đã xóa thành viên");
    }

    @GetMapping("/invitations/me")
    public ResponseEntity<?> getMyInvitations() {
        String userId = TokenUtils.getCurrentUserId();
        return ResponseEntity.ok(teamService.getMyInvitations(userId));
    }

    @PutMapping("/invitations/{id}")
    public ResponseEntity<?> respondToInvitation(@PathVariable("id") String invitationId, @RequestBody Map<String, Boolean> body) {
        String userId = TokenUtils.getCurrentUserId();
        teamService.respondToInvitation(invitationId, userId, body.get("accept"));
        return ResponseEntity.ok("Phản hồi thành công");
    }
}