package com.example.backend.entity;

public class Enums {
    public enum UserRole { PLAYER, OWNER, ADMIN }
    public enum TeamLevel { BEGINNER, INTERMEDIATE, ADVANCED }
    public enum FieldType { FIVE_A_SIDE, SEVEN_A_SIDE, ELEVEN_A_SIDE }
    public enum TimeSlotStatus { AVAILABLE, MAINTENANCE }
    public enum BookingStatus { PENDING, DEPOSIT_PAID, CONFIRMED, CANCELLED, COMPLETED }
    public enum PaymentMethod { STRIPE, CASH }
    public enum PaymentStatus { PENDING, SUCCESS, FAILED, REFUNDED }
    public enum PostType { FIND_OPPONENT, FIND_MEMBER }
    public enum PostStatus { OPEN, MATCHED, CLOSED, EXPIRED }
    public enum RequestStatus { PENDING, ACCEPTED, REJECTED }
    public enum ConversationType { DIRECT, MATCH_GROUP }
    public enum NotificationType { SYSTEM, BOOKING_UPDATE, MATCH_REQUEST, NEW_MESSAGE }
}

