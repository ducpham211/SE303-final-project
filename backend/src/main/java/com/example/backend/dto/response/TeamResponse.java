package com.example.backend.dto.response;

import com.example.backend.utils.Enums;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class TeamResponse {
    private String id;
    private String name;
    private String description;
    private String captainId;
    private Enums.TeamLevel level;
    private LocalDateTime createdAt;
}
