import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane } from 'react-icons/fa'

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'init-bot', content: 'Xin chào! Tôi là trợ lý AI. Bạn cần hỗ trợ về việc gì?', senderId: 'bot' }
  ]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('guest-session');
  const messagesEndRef = useRef(null);

  // UI-only mode: no backend chat API call.

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setCurrentUserId(decodedPayload.sub || decodedPayload.id || decodedPayload.userId || 'guest-session');
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newUserMsg = { id: Date.now().toString(), content: messageText, senderId: currentUserId };
    setMessages(prev => [...prev, newUserMsg]);
    const currentMessage = messageText;
    setMessageText('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg = {
        id: Date.now().toString() + 'bot',
        content: 'Hiện tại tôi đang gặp sự cố kết nối. Bạn vui lòng thử lại sau.',
        senderId: 'bot'
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className={`fixed right-6 flex flex-col items-end ${isOpen ? 'bottom-6 z-50' : 'bottom-24 z-40'}`}>
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4">
          <div className="bg-[#60D86E] p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <FaRobot className="text-2xl" />
              <div>
                <h3 className="font-bold text-sm">Trợ lý AI Timsanbong</h3>
                <p className="text-[10px] text-white/80">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition text-xl leading-none">
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => {
              const isMine = msg.senderId !== 'bot';
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && <div className="w-8 h-8 bg-[#60D86E] text-white rounded-full flex items-center justify-center mr-2 flex-shrink-0"><FaRobot className="text-2xl" /></div>}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMine ? 'bg-[#60D86E] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-8 h-8 bg-[#60D86E] text-white rounded-full flex items-center justify-center flex-shrink-0"><FaRobot className="text-2xl" /></div>
                <div className="bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm flex items-center gap-1">
                  <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập câu hỏi..."
              className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 text-sm rounded-full outline-none focus:ring-2 focus:ring-[#60D86E] transition"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button 
              type="submit"
              className="w-10 h-10 bg-[#60D86E] hover:bg-[#45c45a] text-white rounded-full flex items-center justify-center transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!messageText.trim() || isTyping}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#60D86E] hover:bg-[#45c45a] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition transform duration-200"
        >
          <FaRobot className="text-2xl" />
        </button>
      )}
    </div>
  );
};

export default FloatingChatbot;