package com.example.backend.service.impl;

import com.example.backend.dto.request.ReviewCreateRequest;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.entity.Booking;
import com.example.backend.entity.Review;
import com.example.backend.exception.AppException;
import com.example.backend.mapper.ReviewMapper;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.service.ReviewService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse createReview(String userId, ReviewCreateRequest request) {
        String targetFieldId = request.getFieldId();

        if (request.getBookingId() != null && !request.getBookingId().isEmpty()) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy đặt sân này"));

            if (!booking.getUserId().equals(userId)) {
                throw new AppException(403, "Bạn không có quyền đánh giá sân này");
            }

            if (reviewRepository.existsByBookingId(booking.getId())) {
                throw new AppException(400, "Bạn đã đánh giá sân này rồi");
            }
            
            targetFieldId = booking.getFieldId();
        } 
        else if (targetFieldId == null || targetFieldId.isEmpty()) {
            throw new AppException(400, "Thiếu thông tin sân bóng để đánh giá");
        }

        Review review = reviewMapper.toEntity(request);
        review.setUserId(userId);
        review.setFieldId(targetFieldId);
        review.setImageUrl(request.getImageUrl());
        review.setCreatedAt(LocalDateTime.now());
        review = reviewRepository.save(review);

        return reviewMapper.toResponse(review);
    }

    @Override
    public List<ReviewResponse> getReviewsByFieldId(String fieldId) {
        return reviewRepository.findByFieldIdOrderByCreatedAtDesc(fieldId)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getMyReviews(String userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }
}