package com.example.backend.service.impl;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.entity.Enums;
import com.example.backend.entity.MatchRequest;
import com.example.backend.mapper.MatchRequestMapper;
import com.example.backend.repository.MatchRequestRepository;
import com.example.backend.service.MatchRequestService;
import org.springframework.stereotype.Service;

@Service
public class MatchRequestServiceImpl implements MatchRequestService {
    private final MatchRequestRepository matchRequestRepository;
    private final MatchRequestMapper matchRequestMapper;
    public MatchRequestServiceImpl(MatchRequestRepository matchRequestRepository, MatchRequestMapper matchRequestMapper) {
        this.matchRequestRepository = matchRequestRepository;
        this.matchRequestMapper = matchRequestMapper;
    }

    @Override
    public MatchRequestResponse createMatchRequest(MatchRequestCreateRequest request) {
        boolean isAlreadyRequested = matchRequestRepository.existsByPostIdAndRequesterId(
                request.getPostId(),
                request.getRequesterId()
        );

        if (isAlreadyRequested) {
            throw new RuntimeException("Bạn đã gửi yêu cầu nhận kèo cho bài này rồi!");
        }
        MatchRequest matchRequest = matchRequestMapper.toEntity(request);
        matchRequest.setStatus(Enums.RequestStatus.PENDING);
        MatchRequest savedMatchRequest = matchRequestRepository.save(matchRequest);
        return matchRequestMapper.toResponse(savedMatchRequest);
    }
}
