package com.example.backend.utils;

public class Enums {
    public enum UserRole { PLAYER, OWNER, ADMIN }
    public enum TeamLevel { BEGINNER, INTERMEDIATE, ADVANCED }
    public enum FieldType { FIVE_A_SIDE, SEVEN_A_SIDE, ELEVEN_A_SIDE }
    public enum TimeSlotStatus { AVAILABLE, PENDING, BOOKED }
    public enum BookingStatus { PENDING, DEPOSIT_PAID, CONFIRMED, CANCELLED, COMPLETED }
    public enum PaymentMethod { STRIPE, CASH }
    public enum PaymentStatus { PENDING, SUCCESS, FAILED, REFUNDED }
    public enum PostType { FIND_OPPONENT, FIND_MEMBER }
    public enum PostStatus { OPEN, MATCHED, CLOSED, COMPLETED, EXPIRED }
    public enum RequestStatus { PENDING, ACCEPTED, COMPLETED, REJECTED }
    public enum NotificationType { SYSTEM, BOOKING_UPDATE, MATCH_REQUEST, NEW_MESSAGE, USER_UPDATE, PAYMENT_UPDATE, TEAM_INVITE }
    public enum ReviewStatus {AUTO_PASSED, PENDING_ADMIN_REVIEW, PENALIZED}
    public enum ConversationType { DIRECT, MATCH_GROUP, TEAM }
    public enum OpponentRatingType { GOOD, NO_SHOW, BAD_BEHAVIOR }
    public enum FairplayStatus { PENDING, RESOLVED, REJECTED }
    public enum ConversationStatus { ACTIVE, COMPLETED }
}
