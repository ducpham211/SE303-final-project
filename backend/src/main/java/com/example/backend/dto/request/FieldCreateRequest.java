package com.example.backend.dto.request;

import com.example.backend.entity.Enums; // Nhớ import đúng đường dẫn chứa file Enums của bác
import lombok.Data;

@Data
public class FieldCreateRequest {

    private String name; // Tên sân (VD: Sân số 1)

    private Enums.FieldType type; // Loại sân (VD: 5, 7, 11 người...)

    private String coverImage; // Link ảnh bìa của sân
}