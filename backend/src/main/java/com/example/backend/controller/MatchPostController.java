package com.example.backend.controller;

import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.entity.Enums;
import com.example.backend.service.MatchPostService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/match-posts")
@RequiredArgsConstructor
public class MatchPostController {

    private final MatchPostService matchPostService;

    @GetMapping
    public ResponseEntity<Object> getMatchPosts(@RequestParam(required = false) Enums.TeamLevel skillLevel,
                                                @RequestParam(required = false) Enums.PostType postType) {
        return ResponseEntity.ok(matchPostService.getMatchPosts(skillLevel, postType));
    }
    @PostMapping
    public ResponseEntity<MatchPostResponse> createMatchPost(@RequestBody MatchPostCreateRequest request) {
        MatchPostResponse response = matchPostService.createMatchPost(request);
        return ResponseEntity.ok(response);
    }
}
