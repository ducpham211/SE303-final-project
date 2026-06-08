package com.example.backend.service.impl;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.entity.MatchPost;
import com.example.backend.entity.MatchRequest;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.mapper.MatchRequestMapper;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.repository.MatchPostRepository;
import com.example.backend.repository.MatchRequestRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ConversationService;
import com.example.backend.service.NotificationService;
import com.example.backend.utils.Enums;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchRequestServiceImplTest {

    @Mock
    private MatchRequestRepository matchRequestRepository;

    @Mock
    private MatchRequestMapper matchRequestMapper;

    @Mock
    private MatchPostRepository matchPostRepository;

    @Mock
    private ConversationService conversationService;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MatchRequestServiceImpl matchRequestService;

    private final String postId = "post123";
    private final String requesterId = "user123";
    private final String hostId = "host123";

    @BeforeEach
    void setUp() {
    }

    @Test
    void createMatchRequest_Success() {
        // Arrange
        MatchRequestCreateRequest requestDTO = new MatchRequestCreateRequest();
        requestDTO.setPostId(postId);
        requestDTO.setRequesterId(requesterId);

        MatchPost post = new MatchPost();
        post.setId(postId);
        post.setUserId(hostId);
        post.setStatus(Enums.PostStatus.OPEN);
        post.setFieldId("field12345678");

        MatchRequest matchRequest = new MatchRequest();
        matchRequest.setId("request123");

        MatchRequestResponse responseDTO = MatchRequestResponse.builder().id("request123").build();

        when(matchPostRepository.findById(postId)).thenReturn(Optional.of(post));
        when(matchRequestRepository.existsByPostIdAndRequesterId(postId, requesterId)).thenReturn(false);
        when(matchRequestMapper.toEntity(any(MatchRequestCreateRequest.class))).thenReturn(matchRequest);
        when(matchRequestRepository.save(any(MatchRequest.class))).thenReturn(matchRequest);
        when(userRepository.findById(requesterId)).thenReturn(Optional.of(new User()));
        when(conversationRepository.findDirectConversationBetweenUsers(any(Enums.ConversationType.class), anyString(),
                anyString()))
                .thenReturn(Optional.empty());
        when(matchRequestMapper.toResponse(any(MatchRequest.class))).thenReturn(responseDTO);

        // Act
        MatchRequestResponse result = matchRequestService.createMatchRequest(requestDTO);

        // Assert
        assertNotNull(result);
        assertEquals("request123", result.getId());
        verify(matchRequestRepository, times(1)).save(any(MatchRequest.class));
        verify(notificationService, times(1)).createAndSendNotification(eq(hostId), any());
    }

    @Test
    void createMatchRequest_Fail_SameUser() {
        // Arrange
        MatchRequestCreateRequest requestDTO = new MatchRequestCreateRequest();
        requestDTO.setPostId(postId);
        requestDTO.setRequesterId(hostId); // Same as host

        MatchPost post = new MatchPost();
        post.setId(postId);
        post.setUserId(hostId);

        when(matchPostRepository.findById(postId)).thenReturn(Optional.of(post));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            matchRequestService.createMatchRequest(requestDTO);
        });

        assertEquals(400, exception.getStatusCode());
        assertTrue(exception.getMessage().contains("Không thể tự nhận kèo"));
    }

    @Test
    void createMatchRequest_Fail_PostClosed() {
        // Arrange
        MatchRequestCreateRequest requestDTO = new MatchRequestCreateRequest();
        requestDTO.setPostId(postId);
        requestDTO.setRequesterId(requesterId);

        MatchPost post = new MatchPost();
        post.setId(postId);
        post.setUserId(hostId);
        post.setStatus(Enums.PostStatus.CLOSED);

        when(matchPostRepository.findById(postId)).thenReturn(Optional.of(post));

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            matchRequestService.createMatchRequest(requestDTO);
        });

        assertEquals(400, exception.getStatusCode());
        assertTrue(exception.getMessage().contains("Bài đăng này đã đóng"));
    }

    @Test
    void updateRequestStatus_Accept_Success() {
        // Arrange
        String requestId = "req123";
        MatchRequestStatusCreateRequest dto = new MatchRequestStatusCreateRequest();
        dto.setStatus(Enums.RequestStatus.ACCEPTED);

        MatchRequest request = new MatchRequest();
        request.setId(requestId);
        request.setPostId(postId);
        request.setStatus(Enums.RequestStatus.PENDING);
        request.setRequesterId(requesterId);

        MatchPost post = new MatchPost();
        post.setId(postId);
        post.setUserId(hostId);
        post.setStatus(Enums.PostStatus.OPEN);

        when(matchRequestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(matchPostRepository.findById(postId)).thenReturn(Optional.of(post));
        when(matchRequestRepository.save(any(MatchRequest.class))).thenReturn(request);
        when(matchRequestMapper.toStatusResponse(any(MatchRequest.class))).thenReturn(new MatchRequestStatusResponse());

        // Act
        MatchRequestStatusResponse result = matchRequestService.updateRequestStatus(requestId, hostId, dto);

        // Assert
        assertNotNull(result);
        verify(matchPostRepository, times(1)).save(post); // post closed
        assertEquals(Enums.PostStatus.CLOSED, post.getStatus());
        verify(notificationService, times(1)).createAndSendNotification(eq(requesterId), any());
    }
}
