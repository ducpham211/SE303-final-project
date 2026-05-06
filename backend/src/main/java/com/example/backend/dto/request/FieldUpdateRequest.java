package com.example.backend.dto.request;

import com.example.backend.utils.Enums;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldUpdateRequest {
    private String name;
    private Enums.FieldType type;
    private String coverImage;
}
