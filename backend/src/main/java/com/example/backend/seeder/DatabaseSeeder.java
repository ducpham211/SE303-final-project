package com.example.backend.seeder;

import com.example.backend.entity.*;
import com.example.backend.repository.*;
import com.example.backend.utils.Enums;
import com.example.backend.utils.HashUtils;
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
        // --- Định nghĩa danh sách tên và ảnh thật cho các sân bóng ---
        String[] fieldNames = {
                "Sân Bóng 1",
                "Sân Bóng 2",
                "Sân Bóng 3",
                "Sân Bóng 4",
                "Sân Bóng 5",
                "Sân Bóng 6",
                "Sân Bóng 7",
                "Sân Bóng 8",
                "Sân Bóng 9",
                "Sân Bóng 10"
        };

        String[] fieldImages = {
                "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1556056504-517cf0154fb5?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1600250395178-40da752e5189?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=800&auto=format&fit=crop"
        };

        // 👉 Tự động cập nhật các sân bóng đã có trong DB với tên và ảnh thật mới
        try {
            List<Field> existingFields = fieldRepository.findAll();
            if (!existingFields.isEmpty()) {
                System.out.println("Updating existing fields with new real names and images...");
                for (int i = 0; i < Math.min(existingFields.size(), fieldNames.length); i++) {
                    Field field = existingFields.get(i);
                    field.setName(fieldNames[i]);
                    field.setCoverImage(fieldImages[i]);
                    fieldRepository.save(field);
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi tự động cập nhật sân bóng: " + e.getMessage());
        }

        // 👉 Tự động mã hóa mật khẩu của các user đã tồn tại sang SHA-256 nếu chưa được mã hóa
        try {
            List<User> existingUsers = userRepository.findAll();
            if (!existingUsers.isEmpty()) {
                System.out.println("Checking and encrypting plain-text user passwords to SHA-256...");
                for (User user : existingUsers) {
                    String password = user.getPassword();
                    // Một chuỗi băm SHA-256 Hex luôn có độ dài đúng bằng 64 ký tự.
                    // Nếu mật khẩu không null và độ dài khác 64, tức là mật khẩu chưa được băm (dạng plain text cũ).
                    if (password != null && password.length() != 64) {
                        user.setPassword(HashUtils.hashSHA256(password));
                        userRepository.save(user);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi tự động mã hóa mật khẩu người dùng: " + e.getMessage());
        }

        // ==========================================
        // 1. LUỒNG KHỞI TẠO DỮ LIỆU TĨNH (CHẠY KHI THIẾU PLAYER1)
        // ==========================================
        if (userRepository.findByEmail("24521018@gm.uit.edu.vn").isEmpty()) {
            System.out.println("Seeding entire ecosystem database...");

            // --- TẠO 14 USERS (1 ADMIN, 3 OWNERS, 10 PLAYERS) ---
            User admin = userRepository.findByEmail("admin@system.com").orElse(null);
            if (admin == null) {
                admin = userRepository.save(new User(UUID.randomUUID().toString(), "admin@system.com", HashUtils.hashSHA256("123456"), Enums.UserRole.ADMIN, "System Admin", "0123456780"));
            }

            User owner1 = userRepository.findByEmail("owner1@gmail.com").orElse(null);
            if (owner1 == null) {
                owner1 = userRepository.save(new User(UUID.randomUUID().toString(), "owner1@gmail.com", HashUtils.hashSHA256("123456"), Enums.UserRole.OWNER, "Trần Văn Chủ B", "0123456781"));
            }

            User owner2 = userRepository.findByEmail("owner2@gmail.com").orElse(null);
            if (owner2 == null) {
                owner2 = userRepository.save(new User(UUID.randomUUID().toString(), "owner2@gmail.com", HashUtils.hashSHA256("123456"), Enums.UserRole.OWNER, "Nguyễn Văn Chủ A", "0123456782"));
            }

            User owner3 = userRepository.findByEmail("owner3@gmail.com").orElse(null);
            if (owner3 == null) {
                owner3 = userRepository.save(new User(UUID.randomUUID().toString(), "owner3@gmail.com", HashUtils.hashSHA256("123456"), Enums.UserRole.OWNER, "Lê Văn Chủ C", "0123456783"));
            }

            List<User> players = new ArrayList<>();
            for (int i = 1; i <= 10; i++) {
                String email = (i == 1) ? "24521018@gm.uit.edu.vn" : "player" + i + "@gmail.com";
                User player = userRepository.findByEmail(email).orElse(null);
                if (player == null) {
                    player = new User(
                            UUID.randomUUID().toString(),
                            email,
                            HashUtils.hashSHA256("123456"),
                            Enums.UserRole.PLAYER,
                            "Cầu Thủ " + i,
                            "09876543" + String.format("%02d", i)
                    );
                    player = userRepository.save(player);
                }
                players.add(player);
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
                List<Team> existingTeams = teamRepository.findByCaptainId(players.get(i).getId());
                Team team;
                if (existingTeams.isEmpty()) {
                    team = new Team();
                    team.setName("FC Cầu Thủ " + (i + 1));
                    team.setCaptainId(players.get(i).getId());
                    // Phân bổ trình độ đồng đều để AI có đa dạng dữ liệu phân tích
                    team.setLevel(i % 3 == 0 ? Enums.TeamLevel.BEGINNER : (i % 2 == 0 ? Enums.TeamLevel.ADVANCED : Enums.TeamLevel.INTERMEDIATE));
                    team.setDescription(teamDescriptions[i]); // Thiết lập mô tả chi tiết cho Đội bóng
                    team.setCreatedAt(LocalDateTime.now());
                    team = teamRepository.save(team);
                } else {
                    team = existingTeams.get(0);
                }
                allTeams.add(team);
            }

            // --- TẠO 10 SÂN BÓNG ---
            List<Field> allFields = fieldRepository.findAll();
            if (allFields.isEmpty()) {
                for (int i = 0; i < 10; i++) {
                    Field field = new Field();
                    field.setName(fieldNames[i]);
                    field.setType(i % 3 == 0 ? Enums.FieldType.SEVEN_A_SIDE : Enums.FieldType.FIVE_A_SIDE);
                    field.setCoverImage(fieldImages[i]);
                    field.setCreatedAt(LocalDateTime.now());
                    field.setUpdatedAt(LocalDateTime.now());
                    allFields.add(fieldRepository.save(field));
                }
            }

            // Khởi tạo một số khung giờ (TimeSlot) cho các sân đầu tiên để phục vụ Booking tĩnh
            if (bookingRepository.count() == 0 && !allFields.isEmpty()) {
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
                bookingRepository.save(booking1);
            }

            // --- TẠO BÀI ĐĂNG TÌM ĐỐI THỦ (MATCH POSTS) MẪU CHO TRÍ TUỆ NHÂN TẠO ---
            if (matchPostRepository.count() == 0 && !allFields.isEmpty()) {
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
                    post.setFieldId(allFields.get(i % allFields.size()).getId());

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
            }

            System.out.println("Database ecosystem seeding completed successfully!");
        } else {
            System.out.println("Database already seeded with 24521018@gm.uit.edu.vn. Skipping static seed...");
        }

        // ==========================================
        // 2. LUỒNG CUỐN CHIẾU TIME SLOT (CHẠY MỖI LẦN KHỞI ĐỘNG)
        // ==========================================
        System.out.println("Kiểm tra và cập nhật Time Slots cho các ngày tới...");
        seedDynamicTimeSlots(7); // Tạo trước cho 7 ngày tới (bao gồm cả hôm nay)

        // ==========================================
        // 3. SEED DỮ LIỆU BOOKING TEST CHO 24521018@gm.uit.edu.vn (CHẠY MỖI LẦN KHỞI ĐỘNG)
        // ==========================================
        seedTestBookingsForUITPlayer();
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

    // ==========================================
    // SEED BOOKING TEST CHO 24521018@gm.uit.edu.vn
    // ==========================================

    /**
     * Tạo 25 đơn đặt sân test cho 24521018@gm.uit.edu.vn, phân bổ đều trên 5 mốc thời gian.
     * Chỉ chạy khi user có ít hơn 15 đơn đặt (để tránh duplicate).
     */
    @Transactional
    private void seedTestBookingsForUITPlayer() {
        try {
            User player1 = userRepository.findByEmail("24521018@gm.uit.edu.vn").orElse(null);
            if (player1 == null) {
                System.out.println("[Seeder] Không tìm thấy 24521018@gm.uit.edu.vn, bỏ qua seed test bookings.");
                return;
            }

            long existingCount = bookingRepository.findByUserId(player1.getId()).size();
            if (existingCount >= 15) {
                System.out.println("[Seeder] 24521018@gm.uit.edu.vn đã có " + existingCount + " đơn, bỏ qua seed test bookings.");
                return;
            }

            List<Field> allFields = fieldRepository.findAll();
            if (allFields.isEmpty()) {
                System.out.println("[Seeder] Không có sân nào trong DB, bỏ qua seed test bookings.");
                return;
            }

            System.out.println("[Seeder] Bắt đầu seed 25 booking test cho 24521018@gm.uit.edu.vn...");

            LocalDate today = LocalDate.now();

            // --- Tính toán các mốc ngày ---
            // Thứ Hai của tuần này
            LocalDate mondayOfThisWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);
            // Thứ Hai của tuần sau
            LocalDate mondayOfNextWeek = mondayOfThisWeek.plusWeeks(1);
            // Ngày đầu tháng này
            LocalDate firstDayOfThisMonth = today.withDayOfMonth(1);
            // Ngày đầu tháng trước
            LocalDate firstDayOfLastMonth = firstDayOfThisMonth.minusMonths(1);
            // Ngày cuối tháng trước
            LocalDate lastDayOfLastMonth = firstDayOfThisMonth.minusDays(1);

            // Các khung giờ test đa dạng (startHour, durationHours)
            int[][] timeSlots = {
                {6, 0, 7, 30},   // 06:00 - 07:30
                {9, 0, 10, 30},  // 09:00 - 10:30
                {12, 0, 13, 30}, // 12:00 - 13:30
                {16, 30, 18, 0}, // 16:30 - 18:00
                {19, 30, 21, 0}  // 19:30 - 21:00
            };

            Enums.BookingStatus[] statuses = {
                Enums.BookingStatus.PENDING,
                Enums.BookingStatus.DEPOSIT_PAID,
                Enums.BookingStatus.CONFIRMED,
                Enums.BookingStatus.COMPLETED,
                Enums.BookingStatus.CANCELLED
            };

            BigDecimal[] prices = {
                new BigDecimal("150000"),
                new BigDecimal("200000"),
                new BigDecimal("300000"),
                new BigDecimal("180000"),
                new BigDecimal("250000")
            };

            int fieldCount = allFields.size();

            // ────── Nhóm 1: Hôm nay (5 đơn) ──────
            for (int i = 0; i < 5; i++) {
                LocalDate date = today;
                LocalTime start = LocalTime.of(timeSlots[i][0], timeSlots[i][1]);
                LocalTime end   = LocalTime.of(timeSlots[i][2], timeSlots[i][3]);
                Field field     = allFields.get(i % fieldCount);
                createTestBookingWithSlot(player1, field, date, start, end, prices[i], statuses[i]);
            }

            // ────── Nhóm 2: Tuần này, không phải hôm nay (5 đơn) ──────
            // Chọn các ngày trong tuần trước hôm nay (hoặc sau, nếu hôm nay là thứ Hai)
            int daysIntoWeek = today.getDayOfWeek().getValue(); // 1=Mon, 7=Sun
            for (int i = 0; i < 5; i++) {
                // Lấy các ngày khác trong tuần: nếu hôm nay là thứ 4, dùng T2, T3, T5, T6, T7
                int dayOffset = (i < daysIntoWeek - 1) ? -(daysIntoWeek - 1 - i) : (i - daysIntoWeek + 2);
                LocalDate date = today.plusDays(dayOffset);
                if (date.equals(today)) date = date.plusDays(1); // tránh trùng hôm nay

                // Đảm bảo vẫn trong tuần này
                if (date.isBefore(mondayOfThisWeek) || date.isAfter(mondayOfThisWeek.plusDays(6))) {
                    date = mondayOfThisWeek.plusDays(i % 5 + 1);
                }
                if (date.equals(today)) date = mondayOfThisWeek; // fallback

                LocalTime start = LocalTime.of(timeSlots[i][0], timeSlots[i][1]);
                LocalTime end   = LocalTime.of(timeSlots[i][2], timeSlots[i][3]);
                Field field     = allFields.get((i + 1) % fieldCount);
                createTestBookingWithSlot(player1, field, date, start, end, prices[i], statuses[(i + 1) % 5]);
            }

            // ────── Nhóm 3: Tháng này, không phải tuần này (5 đơn) ──────
            for (int i = 0; i < 5; i++) {
                // Dùng ngày đầu tháng + i*5 ngày, đảm bảo không trong tuần hiện tại
                LocalDate date = firstDayOfThisMonth.plusDays(i * 3);
                // Nếu rơi vào tuần hiện tại, lui lại 7 ngày hoặc dùng fallback
                boolean inThisWeek = !date.isBefore(mondayOfThisWeek) && !date.isAfter(mondayOfThisWeek.plusDays(6));
                if (inThisWeek || date.isAfter(today)) {
                    date = firstDayOfThisMonth.plusDays(i); // đầu tháng thường ngoài tuần này
                }
                // Nếu vẫn trong tháng trước sau khi trừ, giữ nguyên đầu tháng
                if (date.isBefore(firstDayOfThisMonth)) {
                    date = firstDayOfThisMonth;
                }

                LocalTime start = LocalTime.of(timeSlots[i][0], timeSlots[i][1]);
                LocalTime end   = LocalTime.of(timeSlots[i][2], timeSlots[i][3]);
                Field field     = allFields.get((i + 2) % fieldCount);
                createTestBookingWithSlot(player1, field, date, start, end, prices[(i + 2) % 5], statuses[(i + 2) % 5]);
            }

            // ────── Nhóm 4: Tháng trước (5 đơn) ──────
            for (int i = 0; i < 5; i++) {
                // Trải đều trong tháng trước: ngày 5, 10, 15, 20, 25
                int dayOfMonth = Math.min(5 + i * 5, lastDayOfLastMonth.getDayOfMonth());
                LocalDate date = firstDayOfLastMonth.withDayOfMonth(dayOfMonth);

                LocalTime start = LocalTime.of(timeSlots[i][0], timeSlots[i][1]);
                LocalTime end   = LocalTime.of(timeSlots[i][2], timeSlots[i][3]);
                Field field     = allFields.get((i + 3) % fieldCount);
                // Tháng trước chủ yếu là COMPLETED hoặc CANCELLED
                Enums.BookingStatus status = (i % 2 == 0) ? Enums.BookingStatus.COMPLETED : Enums.BookingStatus.CANCELLED;
                createTestBookingWithSlot(player1, field, date, start, end, prices[(i + 3) % 5], status);
            }

            // ────── Nhóm 5: Tương lai / Tuần sau (5 đơn) ──────
            for (int i = 0; i < 5; i++) {
                LocalDate date = mondayOfNextWeek.plusDays(i); // T2 đến T6 tuần sau

                LocalTime start = LocalTime.of(timeSlots[i][0], timeSlots[i][1]);
                LocalTime end   = LocalTime.of(timeSlots[i][2], timeSlots[i][3]);
                Field field     = allFields.get((i + 4) % fieldCount);
                // Tương lai chủ yếu là PENDING hoặc DEPOSIT_PAID
                Enums.BookingStatus status = (i % 2 == 0) ? Enums.BookingStatus.PENDING : Enums.BookingStatus.DEPOSIT_PAID;
                createTestBookingWithSlot(player1, field, date, start, end, prices[(i + 4) % 5], status);
            }

            System.out.println("[Seeder] ✅ Đã seed thành công 25 booking test cho 24521018@gm.uit.edu.vn!");

        } catch (Exception e) {
            System.err.println("[Seeder] ❌ Lỗi khi seed test bookings: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Tạo một TimeSlot lịch sử và một Booking tương ứng cho player.
     */
    private void createTestBookingWithSlot(User player, Field field, LocalDate date,
                                            LocalTime startTime, LocalTime endTime,
                                            BigDecimal price, Enums.BookingStatus status) {
        // 1. Tạo TimeSlot
        TimeSlot slot = new TimeSlot();
        slot.setFieldId(field.getId());
        slot.setStartTime(LocalDateTime.of(date, startTime));
        slot.setEndTime(LocalDateTime.of(date, endTime));
        slot.setPrice(price);
        // Slot đã được đặt → BOOKED (trừ PENDING thì để PENDING)
        slot.setStatus(status == Enums.BookingStatus.PENDING
            ? Enums.TimeSlotStatus.PENDING
            : Enums.TimeSlotStatus.BOOKED);
        slot = timeSlotRepository.save(slot);

        // 2. Tạo Booking
        BigDecimal deposit = price.multiply(new BigDecimal("0.3"));
        Booking booking = new Booking();
        booking.setUserId(player.getId());
        booking.setFieldId(field.getId());
        booking.setTimeSlotId(slot.getId());
        booking.setBookingDate(date);
        booking.setStatus(status);
        booking.setTotalAmount(price);
        booking.setDepositAmount(deposit);
        booking.setNote("Đơn test — " + date);
        booking.setCreatedAt(LocalDateTime.of(date, startTime).minusHours(2));
        booking.setUpdatedAt(LocalDateTime.of(date, startTime).minusHours(1));
        bookingRepository.save(booking);
    }
}
