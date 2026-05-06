package com.example.backend.seeder;

import com.example.backend.entity.*;
import com.example.backend.repository.*;
import com.example.backend.utils.Enums;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
        // ==========================================
        // 1. LUỒNG KHỞI TẠO DỮ LIỆU TĨNH (CHỈ CHẠY 1 LẦN)
        // ==========================================
        if (userRepository.count() == 0) {
            System.out.println("Seeding entire ecosystem database...");

            // --- TẠO 14 USERS (1 ADMIN, 3 OWNERS, 10 PLAYERS) ---
            User admin = userRepository.save(new User(UUID.randomUUID().toString(), "admin@system.com", "123456", Enums.UserRole.ADMIN, "System Admin", "0123456780"));
            User owner1 = userRepository.save(new User(UUID.randomUUID().toString(), "owner1@gmail.com", "123456", Enums.UserRole.OWNER, "Trần Văn Chủ B", "0123456781"));
            User owner2 = userRepository.save(new User(UUID.randomUUID().toString(), "owner2@gmail.com", "123456", Enums.UserRole.OWNER, "Nguyễn Văn Chủ A", "0123456782"));
            User owner3 = userRepository.save(new User(UUID.randomUUID().toString(), "owner3@gmail.com", "123456", Enums.UserRole.OWNER, "Lê Văn Chủ C", "0123456783"));

            List<User> players = new ArrayList<>();
            for (int i = 1; i <= 10; i++) {
                User player = new User(
                        UUID.randomUUID().toString(),
                        "player" + i + "@gmail.com",
                        "123456",
                        Enums.UserRole.PLAYER,
                        "Cầu Thủ " + i,
                        "09876543" + String.format("%02d", i)
                );
                players.add(userRepository.save(player));
            }

            // --- TẠO 10 TEAMS TƯƠNG ỨNG VỚI 10 PLAYERS ---
            String[] teamDescriptions = {
                    "Tập thể sinh viên đại học, thể lực sung mãn, lối đá pressing tầm cao.",
                    "Câu lạc bộ kỹ sư công nghệ, ưu tiên ban bật nhỏ, tránh va chạm mạnh.",
                    "Đội bóng phong trào địa phương, kỹ thuật cá nhân xuất sắc, tính kỷ luật cao.",
                    "Nhóm bạn đồng nghiệp xả stress cuối tuần, không quan trọng thắng thua.",
                    "Đội hình cựu chiến binh, nhịp độ thi đấu chậm, chú trọng kiểm soát bóng.",
                    "Tập thể nhân viên tài chính, phong cách fair-play, tôn trọng đối thủ tuyệt đối.",
                    "Câu lạc bộ thể thao bán chuyên, tìm kiếm đối thủ xứng tầm để cọ xát.",
                    "Đội bóng nòng cốt chuẩn bị thi đấu giải, cần rèn luyện chiến thuật phòng ngự phản công.",
                    "Hội anh em đồng hương, lấy giao lưu học hỏi và kết nối làm mục tiêu chính.",
                    "Tập thể yêu thích bóng đá nghệ thuật, thường xuyên thử nghiệm các kỹ thuật cá nhân khó."
            };

            List<Team> allTeams = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                Team team = new Team();
                team.setName("FC Cầu Thủ " + (i + 1));
                team.setCaptainId(players.get(i).getId());
                // Phân bổ trình độ đồng đều để AI có đa dạng dữ liệu phân tích
                team.setLevel(i % 3 == 0 ? Enums.TeamLevel.BEGINNER : (i % 2 == 0 ? Enums.TeamLevel.ADVANCED : Enums.TeamLevel.INTERMEDIATE));
                team.setDescription(teamDescriptions[i]); // Thiết lập mô tả chi tiết cho Đội bóng
                team.setCreatedAt(LocalDateTime.now());
                allTeams.add(teamRepository.save(team));
            }

            // --- TẠO 10 SÂN BÓNG ---
            String[] fieldNames = {
                    "Sân bóng Mỹ Đình 1", "Sân bóng Mỹ Đình 2", "Sân bóng Bách Khoa", "Sân bóng Tao Đàn",
                    "Sân bóng Chảo Lửa", "Sân bóng Phú Nhuận", "Sân bóng Dĩ An 1", "Sân bóng Dĩ An 2",
                    "Sân bóng Thống Nhất", "Sân bóng Quân Khu 7"
            };

            List<Field> allFields = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                Field field = new Field();
                field.setName(fieldNames[i]);
                field.setType(i % 3 == 0 ? Enums.FieldType.SEVEN_A_SIDE : Enums.FieldType.FIVE_A_SIDE);
                field.setCoverImage("https://example.com/san" + (i + 1) + ".jpg");
                field.setCreatedAt(LocalDateTime.now());
                field.setUpdatedAt(LocalDateTime.now());
                allFields.add(fieldRepository.save(field));
            }

            // Khởi tạo một số khung giờ (TimeSlot) cho các sân đầu tiên để phục vụ Booking tĩnh
            TimeSlot slot1 = seedTimeSlotsForField(allFields.get(0), new BigDecimal("200000")).get(0);
            TimeSlot slot3 = seedTimeSlotsForField(allFields.get(2), new BigDecimal("150000")).get(2);

            // --- TẠO GIAO DỊCH ĐẶT SÂN (BOOKINGS) ---
            Booking booking1 = new Booking();
            booking1.setUserId(players.get(3).getId()); // Player 4
            booking1.setFieldId(allFields.get(0).getId());
            booking1.setTimeSlotId(slot1.getId());
            booking1.setBookingDate(LocalDate.now());
            booking1.setStatus(Enums.BookingStatus.CONFIRMED);
            booking1.setTotalAmount(slot1.getPrice());
            booking1.setCreatedAt(LocalDateTime.now());
            booking1.setUpdatedAt(LocalDateTime.now());
            booking1 = bookingRepository.save(booking1);

            // --- TẠO BÀI ĐĂNG TÌM ĐỐI THỦ (MATCH POSTS) MẪU CHO TRÍ TUỆ NHÂN TẠO ---
            System.out.println("Đang tạo 10 dữ liệu MatchPost giả lập phục vụ quá trình huấn luyện AI...");

            String[] aiMessages = {
                    "Cần tìm đối thủ giao lưu thể lực nhẹ nhàng, không sử dụng tiểu xảo.",
                    "Đội đang trong giai đoạn thử nghiệm đội hình, hoan nghênh các đội có lối đá ban bật.",
                    "Thi đấu chuyên môn cao, có trọng tài điều khiển, tính cạnh tranh quyết liệt.",
                    "Giao hữu mang tính chất rèn luyện sức khỏe, ưu tiên đối tác khu vực nội thành.",
                    "Đội chú trọng kiểm soát bóng, không đá rắn, mong muốn tìm đối tác tương đồng về tư duy.",
                    "Sẵn sàng thi đấu dưới áp lực cao, cần cọ xát với các đội có tổ chức chiến thuật tốt.",
                    "Trận đấu mang tính chất dưỡng sinh, tuyệt đối tránh các tình huống tranh chấp nguy hiểm.",
                    "Đội bóng tập hợp dân văn phòng, thể lực hạn chế, mong đối tác nhường nhịn ở những phút cuối.",
                    "Yêu cầu đối tác tuân thủ nghiêm ngặt tinh thần thể thao, đội hình đồng đều.",
                    "Tìm kiếm đối thủ mạnh để giao lưu kỹ năng, sẵn sàng chi trả toàn bộ phí sân bãi nếu thua."
            };

            List<MatchPost> aiPosts = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                MatchPost post = new MatchPost();
                post.setUserId(players.get(i).getId());
                post.setTeamId(allTeams.get(i).getId());
                post.setFieldId(allFields.get(i).getId());

                post.setDate(LocalDate.now().plusDays(i % 5));
                int hour = 16 + (i % 5);
                post.setTimeStart(LocalDateTime.of(post.getDate(), LocalTime.of(hour, 0)));
                post.setTimeEnd(LocalDateTime.of(post.getDate(), LocalTime.of(hour + 1, 30)));

                post.setPostType(Enums.PostType.FIND_OPPONENT);
                post.setSkillLevel(allTeams.get(i).getLevel());
                post.setCostSharing(i % 2 == 0 ? "50-50" : "Đội thua thanh toán 100%");
                post.setMessage(aiMessages[i]);
                post.setStatus(Enums.PostStatus.OPEN);
                post.setCreatedAt(LocalDateTime.now().minusDays(i));

                aiPosts.add(post);
            }
            matchPostRepository.saveAll(aiPosts);

            System.out.println("Database ecosystem seeding completed successfully!");
        } else {
            System.out.println("Database already seeded with core entities. Skipping static seed...");
        }

        // ==========================================
        // 2. LUỒNG CUỐN CHIẾU TIME SLOT (CHẠY MỖI LẦN KHỞI ĐỘNG)
        // ==========================================
        System.out.println("Kiểm tra và cập nhật Time Slots cho các ngày tới...");
        seedDynamicTimeSlots(7); // Tạo trước cho 7 ngày tới (bao gồm cả hôm nay)
    }

    // Hàm tạo slot tự động cuốn chiếu
// Hàm tạo slot tự động cuốn chiếu (ĐÃ TỐI ƯU SIÊU TỐC)
    private void seedDynamicTimeSlots(int daysInAdvance) {
        List<Field> allFields = fieldRepository.findAll();
        if (allFields.isEmpty()) return;

        LocalDate today = LocalDate.now();
        LocalDateTime rangeStart = LocalDateTime.of(today, LocalTime.MIN);
        LocalDateTime rangeEnd = LocalDateTime.of(today.plusDays(daysInAdvance - 1), LocalTime.MAX);

        List<TimeSlot> existingSlots = timeSlotRepository.findByStartTimeBetween(rangeStart, rangeEnd);

        java.util.Set<String> existingSlotKeys = existingSlots.stream()
                .map(slot -> slot.getFieldId() + "_" + slot.getStartTime().toString())
                .collect(java.util.stream.Collectors.toSet());

        LocalTime[] startTimes = {
                LocalTime.of(6, 0), LocalTime.of(7, 30), LocalTime.of(9, 0),
                LocalTime.of(10, 30), LocalTime.of(12, 0), LocalTime.of(13, 30),
                LocalTime.of(15, 0), LocalTime.of(16, 30), LocalTime.of(18, 0),
                LocalTime.of(19, 30), LocalTime.of(21, 0), LocalTime.of(22, 0)
        };
        LocalTime[] endTimes = {
                LocalTime.of(7, 30), LocalTime.of(9, 0), LocalTime.of(10, 30),
                LocalTime.of(12, 0), LocalTime.of(13, 30), LocalTime.of(15, 0),
                LocalTime.of(16, 30), LocalTime.of(18, 0), LocalTime.of(19, 30),
                LocalTime.of(21, 0), LocalTime.of(22, 30), LocalTime.of(23, 30)
        };

        List<TimeSlot> newSlots = new ArrayList<>();

        for (Field field : allFields) {
            BigDecimal defaultPrice = field.getType() == Enums.FieldType.SEVEN_A_SIDE ? new BigDecimal("300000") : new BigDecimal("150000");

            for (int day = 0; day < daysInAdvance; day++) {
                LocalDate date = today.plusDays(day);

                for (int i = 0; i < startTimes.length; i++) {
                    LocalDateTime startTime = LocalDateTime.of(date, startTimes[i]);

                    // Tạo một chuỗi Key để so sánh
                    String slotKey = field.getId() + "_" + startTime.toString();

                    // 👉 TÌM TRONG RAM: Thay vì query DB, chỉ cần kiểm tra Set
                    if (!existingSlotKeys.contains(slotKey)) {
                        TimeSlot slot = new TimeSlot();
                        slot.setFieldId(field.getId());
                        slot.setStartTime(startTime);
                        slot.setEndTime(LocalDateTime.of(date, endTimes[i]));
                        slot.setPrice(defaultPrice);
                        slot.setStatus(Enums.TimeSlotStatus.AVAILABLE);
                        newSlots.add(slot);
                    }
                }
            }
        }

        // 👉 LƯU 1 LẦN DUY NHẤT
        if (!newSlots.isEmpty()) {
            timeSlotRepository.saveAll(newSlots);
            System.out.println("Thành công: Đã tự động tạo thêm " + newSlots.size() + " Time Slots mới!");
        } else {
            System.out.println("Time Slots đã đầy đủ cho " + daysInAdvance + " ngày tới, không cần tạo thêm.");
        }
    }

    // Hàm cũ giữ lại phục vụ cho luồng 1 (cần trả về List<TimeSlot> để lấy ID gán cho Booking)
    private List<TimeSlot> seedTimeSlotsForField(Field field, BigDecimal price) {
        List<TimeSlot> slots = new ArrayList<>();
        LocalDate today = LocalDate.now();

        LocalTime[] startTimes = {
                LocalTime.of(6, 0), LocalTime.of(7, 30), LocalTime.of(9, 0), 
                LocalTime.of(10, 30), LocalTime.of(12, 0), LocalTime.of(13, 30),
                LocalTime.of(15, 0), LocalTime.of(16, 30), LocalTime.of(18, 0), 
                LocalTime.of(19, 30), LocalTime.of(21, 0), LocalTime.of(22, 0)
        };

        LocalTime[] endTimes = {
                LocalTime.of(7, 30), LocalTime.of(9, 0), LocalTime.of(10, 30), 
                LocalTime.of(12, 0), LocalTime.of(13, 30), LocalTime.of(15, 0),
                LocalTime.of(16, 30), LocalTime.of(18, 0), LocalTime.of(19, 30), 
                LocalTime.of(21, 0), LocalTime.of(22, 30), LocalTime.of(23, 30)
        };

        for (int day = 0; day < 2; day++) {
            LocalDate date = today.plusDays(day);
            for (int i = 0; i < startTimes.length; i++) {
                TimeSlot slot = new TimeSlot();
                slot.setFieldId(field.getId());
                slot.setStartTime(LocalDateTime.of(date, startTimes[i]));
                slot.setEndTime(LocalDateTime.of(date, endTimes[i]));
                slot.setPrice(price);
                slot.setStatus(Enums.TimeSlotStatus.AVAILABLE);
                slots.add(slot);
            }
        }
        return timeSlotRepository.saveAll(slots);
    }
}