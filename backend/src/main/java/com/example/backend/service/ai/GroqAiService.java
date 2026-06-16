package com.example.backend.service.ai;

import com.example.backend.dto.aiChatBot.request.ChatCreateRequest;
import com.example.backend.dto.aiChatBot.response.ChatResponse;
import com.example.backend.dto.aiOpponentRecommendation.AiOpponentDto;
import com.example.backend.dto.aiOpponentRecommendation.AiRecommendationResult;
import com.example.backend.entity.Field;
import com.example.backend.utils.Enums;
import com.example.backend.repository.FieldRepository;
import com.example.backend.repository.redis.ChatSessionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.example.backend.entity.redis.ChatSession;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroqAiService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.api.model}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ChatSessionRepository chatSessionRepository;
    private final FieldRepository fieldRepository;

    public record AiAnalysisResult(boolean isToxic, int penaltyScore, String aiReason) {
    }

    public AiAnalysisResult analyzeReview(String content, Enums.OpponentRatingType ratingType) {
        try {
            String prompt = String.format(
                    "Bạn là trọng tài AI của hệ thống bóng đá phủi. Phân tích báo cáo vi phạm đối thủ sau đây:\n" +
                    "- Loại vi phạm người dùng báo cáo: %s\n" +
                    "- Nội dung nhận xét: '%s'\n\n" +
                    "Nhiệm vụ:\n" +
                    "1. Xác định xem nội dung nhận xét có xác nhận hoặc mô tả hành vi vi phạm (bỏ thi đấu, bùng kèo, chơi xấu, bạo lực, chửi bới, phi thể thao) hay không.\n" +
                    "2. Gợi ý điểm phạt (penaltyScore) từ tập {0, 5, 10, 15, 20, 30}. Quy tắc:\n" +
                    "   - Nếu nhận xét xác nhận việc bỏ thi đấu/không đến/bùng kèo (kể cả khi người dùng chọn nhầm loại vi phạm là BAD_BEHAVIOR), hãy gợi ý trừ 20 điểm.\n" +
                    "   - Nếu nhận xét mô tả hành vi chơi xấu/bạo lực/chửi bới trên sân (và loại báo cáo là BAD_BEHAVIOR), hãy gợi ý trừ từ 10 đến 30 điểm tùy mức độ nghiêm trọng.\n" +
                    "   - Nếu nội dung nhận xét là tin nhắn rác, không liên quan, hoặc cho thấy không có vi phạm thực sự nào xảy ra, gợi ý trừ 0 điểm.\n\n" +
                    "Trả VỀ CHÍNH XÁC MỘT JSON duy nhất, KHÔNG thêm text khác:\n" +
                    "{\n" +
                    "  \"isToxic\": true|false,\n" +
                    "  \"penaltyScore\": <integer>,\n" +
                    "  \"reason\": \"<một câu ngắn giải thích lý do gợi ý điểm phạt (<= 100 ký tự)>\",\n" +
                    "  \"evidence\": [\"<câu trích dẫn từ nhận xét làm bằng chứng nếu có>\"]\n" +
                    "}",
                    ratingType.name(),
                    content
            );

            ObjectNode requestBodyNode = objectMapper.createObjectNode();
            requestBodyNode.put("model", model);
            ArrayNode messagesArray = requestBodyNode.putArray("messages");

            ObjectNode userMessageNode = messagesArray.addObject();
            userMessageNode.put("role", "user");
            userMessageNode.put("content", prompt);

            requestBodyNode.put("temperature", 0.2);

            String requestBody = objectMapper.writeValueAsString(requestBodyNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.postForObject(apiUrl, requestEntity, String.class);

            JsonNode rootNode = objectMapper.readTree(response);
            String aiTextResponse = rootNode.path("choices").get(0)
                    .path("message").path("content").asText();

            aiTextResponse = aiTextResponse.replaceAll("```json", "").replaceAll("```", "").trim();

            JsonNode resultNode = objectMapper.readTree(aiTextResponse);
            return new AiAnalysisResult(
                    resultNode.get("isToxic").asBoolean(),
                    resultNode.get("penaltyScore").asInt(),
                    resultNode.get("reason").asText()
            );

        } catch (Exception e) {
            log.error("==== LỖI GỌI GROQ AI ====", e);
            return new AiAnalysisResult(false, 0, "Không thể phân tích do lỗi kết nối AI");
        }
    }

    public List<AiRecommendationResult> recommendOpponents(
            String currentTeamPlaystyle,
            int currentTrustScore,
            List<AiOpponentDto> potentialOpponents) {

        try {
            String opponentsJson = objectMapper.writeValueAsString(potentialOpponents);

            String prompt = String.format(
                    "Bạn là một hệ thống AI ghép kèo bóng đá. Tuyệt đối KHÔNG giao tiếp như con người. " +
                            "Thông tin đội chủ nhà: Lối đá: '%s', Uy tín: %d/100. " +
                            "Danh sách đối thủ (JSON): %s. " +
                            "Nhiệm vụ: Chọn 3 đội phù hợp nhất. " +
                            "QUY TẮC BẮT BUỘC: Chỉ trả về duy nhất một mảng JSON có định dạng [{\"matchId\": \"...\", \"aiReason\": \"...\"}]. " +
                            "Tuyệt đối không thêm bất kỳ từ ngữ nào ngoài JSON. Nếu danh sách đối thủ trống, trả về [].",
                    currentTeamPlaystyle, currentTrustScore, opponentsJson
            );

            ObjectNode requestBodyNode = objectMapper.createObjectNode();
            requestBodyNode.put("model", model);
            ArrayNode messagesArray = requestBodyNode.putArray("messages");

            ObjectNode userMessageNode = messagesArray.addObject();
            userMessageNode.put("role", "user");
            userMessageNode.put("content", prompt);

            requestBodyNode.put("temperature", 0.4);

            String requestBody = objectMapper.writeValueAsString(requestBodyNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(apiUrl, requestEntity, String.class);

            JsonNode rootNode = objectMapper.readTree(response);
            String aiTextResponse = rootNode.path("choices").get(0).path("message").path("content").asText();

            int startIndex = aiTextResponse.indexOf('[');
            int endIndex = aiTextResponse.lastIndexOf(']');

            if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
                String cleanJson = aiTextResponse.substring(startIndex, endIndex + 1);
                return objectMapper.readValue(cleanJson, new TypeReference<List<AiRecommendationResult>>() {
                });
            } else {
                return List.of();
            }

        } catch (Exception e) {
            log.error("==== LỖI GỌI GROQ AI GỢI Ý ====", e);
            return List.of();
        }
    }

    public ChatResponse askChatbot(ChatCreateRequest request) {
        try {
            String currentSessionId = request.getSessionId();
            if (currentSessionId == null || currentSessionId.trim().isEmpty()) {
                currentSessionId = UUID.randomUUID().toString();
            }

            ChatSession session = chatSessionRepository.findById(currentSessionId)
                    .orElse(new ChatSession(currentSessionId, new ArrayList<>()));

            session.getMessages().add(new ChatSession.MessageNode("user", request.getMessage()));

            List<Field> dbFields = fieldRepository.findFieldsWithoutTimeSlots(null);
            String realFieldData = dbFields.isEmpty() 
                ? "Hiện tại hệ thống chưa có sân bóng nào được tạo." 
                : "Hệ thống đang có các sân sau: " + dbFields.stream()
                    .map(f -> String.format("%s (Sân %s người)", f.getName(), f.getType().name().replace("TYPE_", "")))
                    .collect(Collectors.joining("; "));

            String systemContext = "Bạn là trợ lý ảo hỗ trợ khách hàng của Hệ thống Quản lý Sân bóng PitchSyn. " +
                    "Nhiệm vụ của bạn là giải đáp thắc mắc dựa trên các thông tin sau. TUYỆT ĐỐI KHÔNG BỊA ĐẶT THÊM SÂN HOẶC ĐỊA CHỈ KHÁC: " +
                    "- Danh sách sân thực tế lấy từ Database: " + realFieldData + ". " +
                    "- Công thức Trust Score (thang 0-100): Trust Score = (0.40 x TransactionScore) + (0.30 x RatingScore) + (0.20 x CancellationScore) + (0.10 x ActivityScore). " +
                    "Trong đó: TransactionScore = (Số lần thuê thành công / Tổng số lần đặt) x 100; " +
                    "RatingScore = (Điểm trung bình / 5) x 100; " +
                    "CancellationScore = (Số lần hủy >= 24h / Tổng số lần hủy) x 100 (nếu không hủy = 100); " +
                    "ActivityScore = (Số ngày đăng nhập trong 30 ngày / 30) x 100. " +
                    "(LƯU Ý QUAN TRỌNG: Bạn chỉ được trình bày công thức bằng văn bản thuần túy (Plain Text) cho người dùng dễ đọc. TUYỆT ĐỐI KHÔNG sử dụng định dạng toán học LaTeX như \\[ \\], \\text, hay \\frac). " +
                    "- Quy trình thanh toán tiền sân. " +
                    "- Quy trình tìm kiếm đối thủ hoặc cầu đá thuê. " +
                    "- Khung giờ hoạt động: Từ 06:00 đến 23:30 hàng ngày. " +
                    "- Chính sách hủy sân: Hủy trước 24 giờ được hoàn 100% tiền cọc. Hủy trước 12 giờ hoàn 50%. Hủy sát giờ không được hoàn tiền. " +
                    "- Dịch vụ đi kèm: Miễn phí trà đá, nước và áo bíp. " +
                    "- Lưu ý: Để xem lịch trống chi tiết hoặc đặt sân, hãy hướng dẫn khách truy cập mục Tìm Sân trên website. " +
                    "Yêu cầu giao tiếp: Trả lời ngắn gọn, lịch sự, chuyên nghiệp.";

            ObjectNode requestBodyNode = objectMapper.createObjectNode();
            requestBodyNode.put("model", model);
            ArrayNode messagesArray = requestBodyNode.putArray("messages");

            ObjectNode systemNode = messagesArray.addObject();
            systemNode.put("role", "system");
            systemNode.put("content", systemContext);

            List<ChatSession.MessageNode> chatMessages = session.getMessages();
            int limit = 10;
            int startIdx = Math.max(0, chatMessages.size() - limit);
            for (int i = startIdx; i < chatMessages.size(); i++) {
                ChatSession.MessageNode msg = chatMessages.get(i);
                if ("system".equals(msg.getRole())) {
                    continue;
                }
                ObjectNode msgNode = messagesArray.addObject();
                msgNode.put("role", msg.getRole());
                msgNode.put("content", msg.getContent());
            }
            requestBodyNode.put("temperature", 0.5);

            String requestBody = objectMapper.writeValueAsString(requestBodyNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(apiUrl, requestEntity, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            String aiReply = rootNode.path("choices").get(0).path("message").path("content").asText();

            session.getMessages().add(new ChatSession.MessageNode("assistant", aiReply));
            
            List<ChatSession.MessageNode> cleanedMessages = session.getMessages().stream()
                    .filter(m -> !"system".equals(m.getRole()))
                    .collect(Collectors.toList());
            session.setMessages(cleanedMessages);
            
            chatSessionRepository.save(session);

            return new ChatResponse(aiReply, currentSessionId);

        } catch (Exception e) {
            log.error("Lỗi hệ thống khi xử lý Chatbot: ", e);
            return new ChatResponse("Lỗi hệ thống: " + e.toString(), null);
        }
    }
}