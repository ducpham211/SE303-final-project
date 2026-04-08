package com.example.backend.dto.request;

import lombok.Data;

@Data
public class AdminCreateRequest {
    private boolean approve; // true = Đồng ý phạt, false = Bác bỏ (Review không vi phạm)
    private Integer finalPenalty;
}
