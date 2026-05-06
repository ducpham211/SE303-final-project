package com.example.backend.controller;

import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.dto.response.RecommendedMatchResponse;
import com.example.backend.utils.Enums;
import com.example.backend.utils.TokenUtils;
import com.example.backend.service.MatchPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/match-posts")
@RequiredArgsConstructor
public class MatchPostController {

    private final MatchPostService matchPostService;

    @GetMapping
    public ResponseEntity<Page<MatchPostResponse>> getMatchPosts(
            @RequestParam(required = false) Enums.TeamLevel skillLevel,
            @RequestParam(required = false) Enums.PostType postType, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(matchPostService.getMatchPosts(skillLevel, postType, page, size));
    }

    @PostMapping
    public ResponseEntity<MatchPostResponse> createMatchPost(@RequestBody MatchPostCreateRequest request) {
        MatchPostResponse response = matchPostService.createMatchPost(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MatchPostResponse> updateMatchPost(
            @PathVariable("id") String postId,
            @RequestBody MatchPostCreateRequest request) {
        String currentUserId = TokenUtils.getCurrentUserId();
        MatchPostResponse response = matchPostService.updateMatchPost(postId, currentUserId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatchPost(@PathVariable("id") String postId) {
        String currentUserId = TokenUtils.getCurrentUserId();
        matchPostService.deleteMatchPost(postId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendedMatchResponse>> getSmartRecommendations(
            @RequestParam String playstyle) {

        String currentUserId = TokenUtils.getCurrentUserId();

        List<RecommendedMatchResponse> recommendations = matchPostService.getSmartRecommendations(currentUserId,
                playstyle);

        return ResponseEntity.ok(recommendations);
    }
}
