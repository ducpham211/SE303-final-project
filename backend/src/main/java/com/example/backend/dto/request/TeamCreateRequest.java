package com.example.backend.dto.request;

import com.example.backend.utils.Enums;
import lombok.Data;

@Data
public class TeamCreateRequest {
    private String name;
    private String description;
    private String captainId;
    private Enums.TeamLevel level;
}
