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
    @Override
    public MatchPostResponse updateMatchPost(String postId, String currentUserId, MatchPostCreateRequest request){
        MatchPost matchPost = matchPostRepository.findById(postId).orElseThrow(()-> new RuntimeException("Không tìm thấy bài đăng!"));
        if(!matchPost.getUserId().equals(currentUserId)){
            throw new RuntimeException("Bạn không phải chủ bài đăng, không có quyền sửa bài đăng này");
        }
        if (request.getTeamId() != null) matchPost.setTeamId(request.getTeamId());
        if (request.getFieldId() != null) matchPost.setFieldId(request.getFieldId());
        if (request.getBookingId() != null) matchPost.setBookingId(request.getBookingId());
        if (request.getDate() != null) matchPost.setDate(request.getDate());
        if (request.getTimeStart() != null) matchPost.setTimeStart(request.getTimeStart());
        if (request.getTimeEnd() != null) matchPost.setTimeEnd(request.getTimeEnd());
        if (request.getPostType() != null) matchPost.setPostType(request.getPostType());
        if (request.getSkillLevel() != null) matchPost.setSkillLevel(request.getSkillLevel());
        if (request.getCostSharing() != null) matchPost.setCostSharing(request.getCostSharing());
        if (request.getMessage() != null) matchPost.setMessage(request.getMessage());
        MatchPost savedMatchPost = matchPostRepository.save(matchPost);
        return matchPostMapper.toResponse(savedMatchPost);
    }
    @Override
    public void deleteMatchPost(String postId, String currentUserId) {
        MatchPost matchPost = matchPostRepository.findById(postId).orElseThrow(()-> new RuntimeException("Không tìm thấy bài đăng!"));
        if(!matchPost.getUserId().equals(currentUserId)){
            throw new RuntimeException("Không có quyền xóa bài viết này ");
    }
        matchPostRepository.delete(matchPost);
    }

}