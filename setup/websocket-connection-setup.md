# 🚀 Hướng Dẫn Tích Hợp Real-time Chat (WebSocket + STOMP)

Tài liệu này hướng dẫn Frontend (ReactJS/VueJS) cách kết nối vào hệ thống WebSocket để nhận tin nhắn Real-time cho tính năng Chat.

## 1. 🏗️ Luồng Kiến Trúc (Hybrid Approach)

Hệ thống của chúng ta sử dụng kiến trúc Lai (Hybrid) chuẩn thực tế:

- **GỬI TIN NHẮN:** Dùng API POST (REST API bình thường) kèm Token JWT. Không gửi trực tiếp qua Socket để đảm bảo bảo mật và dễ dàng mở rộng (gửi ảnh/file sau này).
- **NHẬN TIN NHẮN:** Dùng WebSocket kết hợp giao thức STOMP. Frontend chỉ việc "cắm ống hút" (Subscribe) vào phòng chat và há miệng chờ tin nhắn rơi xuống.

## 2. 📦 Cài Đặt Thư Viện (ReactJS)

Backend sử dụng chuẩn STOMP over SockJS. Anh em Frontend cần cài 2 thư viện chuẩn này:

```bash
npm install sockjs-client @stomp/stompjs
# Hoặc nếu dùng yarn:
yarn add sockjs-client @stomp/stompjs
```

*(Lưu ý: Bắt buộc dùng `@stomp/stompjs` bản mới, không dùng thư viện `stompjs` cũ vì nó đã bị bỏ hoang).*

## 3. 🔌 Thông Số Kết Nối Chìa Khóa

- **Đường dẫn cắm Socket (Endpoint):** `http://localhost:8080/ws` (Không cần Token ở bước kết nối này).
- **Kênh lắng nghe (Topic):** `/topic/conversations/{conversationId}` (Mỗi phòng chat là 1 kênh riêng biệt).

Định dạng dữ liệu nhận về (JSON):

```json
{
  "id": "msg-123",
  "conversationId": "conv-456",
  "senderId": "user-789",
  "content": "Nội dung tin nhắn nè ae",
  "createdAt": "2026-03-31T20:00:00"
}
```

## 4. 💻 Code Mẫu ReactJS (Copy là chạy)

Dưới đây là một Component mẫu đã cấu hình sẵn luồng kết nối, lắng nghe và dọn dẹp bộ nhớ đúng chuẩn React Hook:

```javascript
import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

const ChatRoom = ({ conversationId, currentUserToken }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");

        // 1. KẾT NỐI VÀ LẮNG NGHE SOCKET
        useEffect(() => {
            // Tạo client STOMP
            const stompClient = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                debug: (str) => console.log('STOMP: ' + str), // Bật log để dễ debug
                reconnectDelay: 5000, // Tự động kết nối lại nếu rớt mạng
            });

            stompClient.onConnect = (frame) => {
                console.log('✅ Đã kết nối Socket thành công!');

                // Đăng ký kênh lắng nghe của phòng chat này
                const topic = `/topic/conversations/${conversationId}`;
                
                stompClient.subscribe(topic, (message) => {
                    // Khi có tin nhắn mới bay tới
                    const newMsg = JSON.parse(message.body);
                    console.log('📬 Có tin nhắn mới:', newMsg);
                    
                    // Cập nhật vào state để render lên UI
                    setMessages(prev => [...prev, newMsg]);
                });
            };

            stompClient.onStompError = (frame) => {
                console.error('❌ Lỗi Socket: ' + frame.headers['message']);
            };

            // Kích hoạt kết nối
            stompClient.activate();

            // DỌN DẸP: Ngắt kết nối khi user thoát khỏi Component (Cực kỳ quan trọng để chống rò rỉ bộ nhớ)
            return () => {
                if (stompClient.active) {
                    stompClient.deactivate();
                    console.log('🛑 Đã ngắt kết nối Socket');
                }
            };
        }, [conversationId]); // Chạy lại nếu user đổi phòng chat khác

        // 2. HÀM GỬI TIN NHẮN (DÙNG REST API)
        const sendMessage = async () => {
            if (!inputText.trim()) return;

            try {
                await axios.post(
                    `http://localhost:8080/api/conversations/${conversationId}/messages`,
                    { content: inputText },
                    {
                        headers: {
                            'Authorization': `Bearer ${currentUserToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                // Gửi thành công thì xóa ô input, 
                // KHÔNG CẦN push vào state 'messages' ở đây vì Socket sẽ tự dội ngược tin nhắn về
                setInputText(""); 
            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn:", error);
                alert("Không thể gửi tin nhắn!");
            }
        };

        // 3. RENDER GIAO DIỆN
        return (
            <div style={{ padding: 20, maxWidth: 400, border: '1px solid #ccc' }}>
                <h3>Phòng Chat: {conversationId}</h3>
                
                <div style={{ height: 300, overflowY: 'scroll', background: '#f9f9f9', padding: 10, marginBottom: 10 }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{ marginBottom: 10 }}>
                            <strong>{msg.senderId}: </strong> {msg.content}
                            <br/>
                            <small style={{ color: 'gray' }}>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                        </div>
                    ))}
                </div>

                <input 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Nhập tin nhắn..." 
                    style={{ width: '70%', padding: 8 }}
                />
                <button onClick={sendMessage} style={{ width: '25%', padding: 8, marginLeft: '2%' }}>Gửi</button>
            </div>
        );
    };

    export default ChatRoom;
```

## 5. ⚠️ Những Lưu Ý Xương Máu Cho Frontend

- **Không tự nối chuỗi (Push) tin nhắn của mình vào UI:** Khi user bấm Gửi, Frontend chỉ cần gọi API POST rồi ngồi im. API lưu vào DB xong sẽ bắn Socket về hàm subscribe. Lúc đó UI tự động cập nhật. Tránh tình trạng tin nhắn hiển thị 2 lần.
- **Quản lý Token:** API gửi tin nhắn (POST) bắt buộc phải gắn Header `Authorization: Bearer <token>`.
- **Đổi phòng chat:** Hàm `useEffect` sẽ tự động dọn dẹp ngắt kết nối kênh cũ và mở kênh mới nếu biến `conversationId` thay đổi.