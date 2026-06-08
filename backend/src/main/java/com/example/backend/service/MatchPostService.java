package com.example.backend.service;

import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.dto.response.RecommendedMatchResponse;
import com.example.backend.utils.Enums;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MatchPostService {
    MatchPostResponse createMatchPost(MatchPostCreateRequest request);
    Page<MatchPostResponse> getMatchPosts(Enums.TeamLevel skillLevel, Enums.PostType postType, int page, int size);
    MatchPostResponse updateMatchPost(String postId, String currentUserId, MatchPostCreateRequest request);
    void deleteMatchPost(String postId, String currentUserId);
    public List<RecommendedMatchResponse> getSmartRecommendations(String currentUserId, String playstyleNote);
    void markAsComplete(String postId, String currentUserId, String fieldId);
    Page<MatchPostResponse> getMyActivePosts(String userId, int page, int size);
    Page<MatchPostResponse> getMatchHistory(String userId, int page, int size);
    List<MatchPostResponse> getActiveLiveMatches();
}
