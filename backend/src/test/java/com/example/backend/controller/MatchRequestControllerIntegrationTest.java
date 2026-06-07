package com.example.backend.controller;

import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.service.MatchRequestService;
import com.example.backend.utils.Enums;
import com.example.backend.utils.TokenUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.example.backend.security.JwtAuthenticationFilter;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MatchRequestController.class)
@AutoConfigureMockMvc(addFilters = false)
class MatchRequestControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MatchRequestService matchRequestService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private MockedStatic<TokenUtils> mockedTokenUtils;

    @BeforeEach
    void setUp() {
        // Mock TokenUtils tĩnh vì MatchRequestController gọi TokenUtils.getCurrentUserId()
        mockedTokenUtils = Mockito.mockStatic(TokenUtils.class);
        mockedTokenUtils.when(TokenUtils::getCurrentUserId).thenReturn("user123");
    }

    @AfterEach
    void tearDown() {
        mockedTokenUtils.close();
    }

    @Test
    @WithMockUser
    void createMatchRequest_ReturnsOk() throws Exception {
        MatchRequestCreateRequest request = new MatchRequestCreateRequest();
        request.setPostId("post1");
        request.setRequesterId("user123");

        MatchRequestResponse response = MatchRequestResponse.builder().id("req1").build();

        when(matchRequestService.createMatchRequest(any(MatchRequestCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/match-requests")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("req1"));
    }

    @Test
    @WithMockUser
    void updateRequestStatus_ReturnsOk() throws Exception {
        MatchRequestStatusCreateRequest request = new MatchRequestStatusCreateRequest();
        request.setStatus(Enums.RequestStatus.ACCEPTED);

        MatchRequestStatusResponse response = new MatchRequestStatusResponse();
        response.setId("req1");
        response.setStatus(Enums.RequestStatus.ACCEPTED);

        when(matchRequestService.updateRequestStatus(eq("req1"), eq("user123"), any(MatchRequestStatusCreateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/match-requests/req1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("req1"))
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }
}
