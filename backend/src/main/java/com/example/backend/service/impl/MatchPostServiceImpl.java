package com.example.backend.service.impl;

import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.entity.Enums;
import com.example.backend.entity.MatchPost;
import com.example.backend.mapper.MatchPostMapper;
import com.example.backend.repository.MatchPostRepository;
import com.example.backend.service.MatchPostService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MatchPostServiceImpl implements MatchPostService {

    private final MatchPostRepository matchPostRepository;
    private final MatchPostMapper matchPostMapper;

    public MatchPostServiceImpl(MatchPostRepository matchPostRepository, MatchPostMapper matchPostMapper) {
        this.matchPostRepository = matchPostRepository;
        this.matchPostMapper = matchPostMapper;
    }

    @Override
    public MatchPostResponse createMatchPost(MatchPostCreateRequest request) {
        MatchPost matchPost = matchPostMapper.toEntity(request);
        matchPost.setUserId(SecurityContextHolder.getContext().getAuthentication().getName());
        matchPost.setStatus(Enums.PostStatus.OPEN);
        matchPost.setCreatedAt(LocalDateTime.now());
        MatchPost savedMatchPost = matchPostRepository.save(matchPost);
        return matchPostMapper.toResponse(savedMatchPost);
    }

    @Override
    public List<MatchPostResponse> getMatchPosts(Enums.TeamLevel skillLevel, Enums.PostType postType) {
        List<MatchPost> result = matchPostRepository.filterMatchPosts(skillLevel, postType);
        return result.stream().map(matchPostMapper::toResponse).toList();
    }
}