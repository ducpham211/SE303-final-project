package com.example.backend.service;

import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.entity.Enums;

import java.util.List;

public interface MatchPostService {
    MatchPostResponse createMatchPost(MatchPostCreateRequest request);
    List<MatchPostResponse> getMatchPosts(Enums.TeamLevel skillLevel, Enums.PostType postType);
    MatchPostResponse updateMatchPost(String postId, String currentUserId, MatchPostCreateRequest request);
    void deleteMatchPost(String postId, String currentUserId);
}
