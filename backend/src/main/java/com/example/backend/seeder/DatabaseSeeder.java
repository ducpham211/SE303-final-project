package com.example.backend.seeder;

import com.example.backend.entity.*;
import com.example.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final FieldRepository fieldRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final MatchPostRepository matchPostRepository;

    public DatabaseSeeder(UserRepository userRepository, TeamRepository teamRepository, FieldRepository fieldRepository,
            TimeSlotRepository timeSlotRepository, BookingRepository bookingRepository,
            MatchPostRepository matchPostRepository) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.fieldRepository = fieldRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.bookingRepository = bookingRepository;
        this.matchPostRepository = matchPostRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding entire ecosystem database...");

            // 1. Users
            User admin = userRepository
                    .save(new User("admin@system.com", "123456", Enums.UserRole.ADMIN, "System Admin", "0123456780"));
            User owner1 = userRepository
                    .save(new User("owner1@gmail.com", "123456", Enums.UserRole.OWNER, "Trần Văn Chủ B", "0123456781"));
            User owner2 = userRepository.save(
                    new User("owner2@gmail.com", "123456", Enums.UserRole.OWNER, "Nguyễn Văn Chủ A", "0123456782"));
            User player1 = userRepository.save(
                    new User("player1@gmail.com", "123456", Enums.UserRole.PLAYER, "Nguyễn Cầu Thủ 1", "0123456783"));
            User player2 = userRepository
                    .save(new User("player2@gmail.com", "123456", Enums.UserRole.PLAYER, "Lê Cầu Thủ 2", "0123456784"));
            User player3 = userRepository.save(
                    new User("player3@gmail.com", "123456", Enums.UserRole.PLAYER, "Phạm Cầu Thủ 3", "0123456785"));
            User player4 = userRepository.save(
                    new User("player4@gmail.com", "123456", Enums.UserRole.PLAYER, "Trần Cầu Thủ 4", "0123456786"));
            User player5 = userRepository.save(
                    new User("player5@gmail.com", "123456", Enums.UserRole.PLAYER, "Hoàng Cầu Thủ 5", "0123456787"));

            // 2. Teams
            Team team1 = new Team();
            team1.setName("Team Alpha");
            team1.setCaptainId(player1.getId());
            team1.setLevel(Enums.TeamLevel.INTERMEDIATE);
            team1.setCreatedAt(LocalDateTime.now());
            team1 = teamRepository.save(team1);

            Team team2 = new Team();
            team2.setName("Team Beta");
            team2.setCaptainId(player2.getId());
            team2.setLevel(Enums.TeamLevel.ADVANCED);
            team2.setCreatedAt(LocalDateTime.now());
            team2 = teamRepository.save(team2);

            Team team3 = new Team();
            team3.setName("Team Gamma");
            team3.setCaptainId(player3.getId());
            team3.setLevel(Enums.TeamLevel.BEGINNER);
            team3.setCreatedAt(LocalDateTime.now());
            team3 = teamRepository.save(team3);

            // 3. Fields
            Field field1 = new Field();
            field1.setName("Sân bóng Mỹ Đình 1");
            field1.setType(Enums.FieldType.FIVE_A_SIDE);
            field1.setCoverImage("https://example.com/san1.jpg");
            field1.setStatus(Enums.FieldStatus.AVAILABLE);
            field1.setCreatedAt(LocalDateTime.now());
            field1.setUpdatedAt(LocalDateTime.now());
            field1 = fieldRepository.save(field1);
            TimeSlot slot1 = seedTimeSlotsForField(field1, new BigDecimal("200000")).get(0);

            Field field2 = new Field();
            field2.setName("Sân bóng Mỹ Đình 2");
            field2.setType(Enums.FieldType.SEVEN_A_SIDE);
            field2.setCoverImage("https://example.com/san2.jpg");
            field2.setStatus(Enums.FieldStatus.AVAILABLE);
            field2.setCreatedAt(LocalDateTime.now());
            field2.setUpdatedAt(LocalDateTime.now());
            field2 = fieldRepository.save(field2);

            Field field3 = new Field();
            field3.setName("Sân bóng Bách Khoa");
            field3.setType(Enums.FieldType.FIVE_A_SIDE);
            field3.setCoverImage("https://example.com/san3.jpg");
            field3.setStatus(Enums.FieldStatus.AVAILABLE);
            field3.setCreatedAt(LocalDateTime.now());
            field3.setUpdatedAt(LocalDateTime.now());
            field3 = fieldRepository.save(field3);
            TimeSlot slot3 = seedTimeSlotsForField(field3, new BigDecimal("150000")).get(2);

            // 4. Bookings
            Booking booking1 = new Booking();
            booking1.setUserId(player4.getId());
            booking1.setFieldId(field1.getId());
            booking1.setTimeSlotId(slot1.getId());
            booking1.setBookingDate(LocalDate.now());
            booking1.setStatus(Enums.BookingStatus.CONFIRMED);
            booking1.setTotalAmount(slot1.getPrice());
            booking1.setCreatedAt(LocalDateTime.now());
            booking1.setUpdatedAt(LocalDateTime.now());
            booking1 = bookingRepository.save(booking1);

            Booking booking2 = new Booking();
            booking2.setUserId(player5.getId());
            booking2.setFieldId(field3.getId());
            booking2.setTimeSlotId(slot3.getId());
            booking2.setBookingDate(LocalDate.now().plusDays(1));
            booking2.setStatus(Enums.BookingStatus.CONFIRMED);
            booking2.setTotalAmount(slot3.getPrice());
            booking2.setCreatedAt(LocalDateTime.now());
            booking2.setUpdatedAt(LocalDateTime.now());
            booking2 = bookingRepository.save(booking2);

            // 5. MatchPosts
            MatchPost post1 = new MatchPost();
            post1.setUserId(player1.getId());
            post1.setTeamId(team1.getId());
            post1.setFieldId(field2.getId());
            post1.setDate(LocalDate.now().plusDays(2));
            post1.setTimeStart(LocalDateTime.of(LocalDate.now().plusDays(2), LocalTime.of(19, 0)));
            post1.setTimeEnd(LocalDateTime.of(LocalDate.now().plusDays(2), LocalTime.of(20, 30)));
            post1.setPostType(Enums.PostType.FIND_OPPONENT);
            post1.setSkillLevel(Enums.TeamLevel.INTERMEDIATE);
            post1.setCostSharing("50-50");
            post1.setMessage("Giao lưu vui vẻ, không quạu.");
            post1.setStatus(Enums.PostStatus.OPEN);
            post1.setCreatedAt(LocalDateTime.now());
            matchPostRepository.save(post1);

            MatchPost post2 = new MatchPost();
            post2.setUserId(player4.getId());
            post2.setFieldId(field1.getId());
            post2.setBookingId(booking1.getId());
            post2.setDate(LocalDate.now());
            post2.setTimeStart(slot1.getStartTime());
            post2.setTimeEnd(slot1.getEndTime());
            post2.setPostType(Enums.PostType.FIND_MEMBER);
            post2.setSkillLevel(Enums.TeamLevel.BEGINNER);
            post2.setCostSharing("Share đều tiền sân 30k/người");
            post2.setMessage("Đội mình còn thiếu 2 người đá cánh, anh em nào rảnh vào đá cùng cho vui nhé.");
            post2.setStatus(Enums.PostStatus.OPEN);
            post2.setCreatedAt(LocalDateTime.now());
            matchPostRepository.save(post2);

            System.out.println("Database ecosystem seeding completed successfully!");
        } else {
            System.out.println("Database already seeded. Skipping...");
        }
    }

    private List<TimeSlot> seedTimeSlotsForField(Field field, BigDecimal price) {
        List<TimeSlot> slots = new ArrayList<>();
        LocalDate today = LocalDate.now();
        // Create sample slots from 16:00 to 20:00 (1 hour each) for 2 days
        for (int day = 0; day < 2; day++) {
            LocalDate date = today.plusDays(day);
            for (int i = 16; i < 20; i++) {
                TimeSlot slot = new TimeSlot();
                slot.setFieldId(field.getId());
                slot.setStartTime(LocalDateTime.of(date, LocalTime.of(i, 0)));
                slot.setEndTime(LocalDateTime.of(date, LocalTime.of(i + 1, 0)));
                slot.setPrice(price);
                slots.add(slot);
            }
        }
        return timeSlotRepository.saveAll(slots);
    }
}
