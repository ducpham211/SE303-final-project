package com.example.backend.service.impl;

import com.example.backend.dto.aiOpponentRecommendation.AiOpponentDto;
import com.example.backend.dto.aiOpponentRecommendation.AiRecommendationResult;
import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.dto.response.RecommendedMatchResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.MatchPost;
import com.example.backend.entity.User;
import com.example.backend.mapper.MatchPostMapper;
import com.example.backend.repository.MatchPostRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.MatchPostService;
import com.example.backend.service.ai.GroqAiService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.backend.service.ai.GroqAiService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import java.util.List;
import com.example.backend.exception.AppException;

@Service
@AllArgsConstructor
public class MatchPostServiceImpl implements MatchPostService {

    private final MatchPostRepository matchPostRepository;
    private final MatchPostMapper matchPostMapper;
    private final UserRepository userRepository;
    private final GroqAiService groqAiService;

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
    public Page<MatchPostResponse> getMatchPosts(Enums.TeamLevel skillLevel, Enums.PostType postType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MatchPost> matchPage = matchPostRepository.filterMatchPosts(skillLevel, postType, pageable);
        return matchPage.map(matchPostMapper::toResponse);
    }
    @Override
    public MatchPostResponse updateMatchPost(String postId, String currentUserId, MatchPostCreateRequest request){
        MatchPost matchPost = matchPostRepository.findById(postId).orElseThrow(()-> new AppException(404, "Không tìm thấy bài đăng!"));
        if(!matchPost.getUserId().equals(currentUserId)){
            throw new AppException(403, "Bạn không phải chủ bài đăng, không có quyền sửa bài đăng này");
        }
        matchPostMapper.updateEntityFromRequest(request, matchPost);
        MatchPost savedMatchPost = matchPostRepository.save(matchPost);
        return matchPostMapper.toResponse(savedMatchPost);
    }
    @Override
    public void deleteMatchPost(String postId, String currentUserId) {
        MatchPost matchPost = matchPostRepository.findById(postId).orElseThrow(()-> new AppException(404, "Không tìm thấy bài đăng!"));
        if(!matchPost.getUserId().equals(currentUserId)){
            throw new AppException(403, "Không có quyền xóa bài viết này ");
    }
        matchPostRepository.delete(matchPost);
    }
    @Override
    public List<RecommendedMatchResponse> getSmartRecommendations(String currentUserId, String playstyleNote) {

        // 1. Lấy thông tin Uy tín của người đang tìm kèo
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy User"));
        int currentTrust = currentUser.getTrustScore() != null ? currentUser.getTrustScore() : 100;

        // 2. LỌC THÔ: Lấy top 15 trận từ Database bằng Pageable
        Pageable top15 = PageRequest.of(0, 15);
        Page<MatchPost> rawMatchesPage = matchPostRepository.findPotentialMatches(currentUserId, top15);
        if (rawMatchesPage.isEmpty()) {
            return List.of(); // Không có ai đang rảnh
        }

        // Cắt lấy 15 trận đầu tiên để nhét cho AI (tránh tràn token)
        List<MatchPost> top15Matches = rawMatchesPage.getContent();

        // 3. Chuẩn bị Dữ liệu nhẹ cho AI
        // 3. Chuẩn bị Dữ liệu nhẹ cho AI
        List<AiOpponentDto> aiInputData = top15Matches.stream()
                .map(m -> {
                    // Sửa lại thành getUserId() thay vì getAuthorId()
                    int opponentTrust = userRepository.findById(m.getUserId().toString())
                            .map(User::getTrustScore).orElse(100);

                    // Sửa lại thành getMessage() thay vì getNote()
                    return new AiOpponentDto(m.getId().toString(), m.getMessage(), opponentTrust);
                })
                .toList();

        // 👉 IN RA ĐỂ KIỂM TRA TRƯỚC KHI GỬI CHO AI
        System.out.println("DỮ LIỆU ĐÃ ĐÓNG GÓI CHO AI: " + aiInputData);
        // 4. LỌC TINH: Gọi Groq AI phán xử
        List<AiRecommendationResult> aiResults = groqAiService.recommendOpponents(
                playstyleNote, currentTrust, aiInputData
        );

        // 5. Build Response trả về cho Frontend (Kèm theo lời giải thích của AI)
        return aiResults.stream().map(aiRes -> {
            // Tìm lại full thông tin trận đấu từ danh sách top15 ban đầu
            MatchPost fullMatchInfo = top15Matches.stream()
                    .filter(m -> m.getId().equals(aiRes.getMatchId()))
                    .findFirst()
                    .orElse(null);

            if (fullMatchInfo == null) return null;

            // Nạp dữ liệu vào DTO cuối cùng (Bạn tự tạo DTO này nhé)
            RecommendedMatchResponse response = new RecommendedMatchResponse();
            response.setMatchId(fullMatchInfo.getId());
            response.setOpponentNote(fullMatchInfo.getMessage());
            response.setAiExplanation(aiRes.getAiReason()); // ✨ ĐÂY LÀ PHẦN ĂN TIỀN NHẤT
            return response;

        }).filter(java.util.Objects::nonNull).toList();
    }

}