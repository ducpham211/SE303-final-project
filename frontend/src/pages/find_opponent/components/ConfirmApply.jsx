import { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

const ConfirmApplyModal = ({ isOpen, match, onClose, onConfirm }) => {
  const [message, setMessage] = useState('Chào bạn, đội mình muốn nhận kèo này!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setMessage('Chào bạn, đội mình muốn nhận kèo này!');
    }
  }, [isOpen]);

  if (!isOpen || !match) return null;

  const handleApplyMatch = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Vui lòng đăng nhập để nhận kèo!');
        setIsSubmitting(false);
        return;
      }

      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const currentUserId = decodedPayload.sub || decodedPayload.id || decodedPayload.userId;

      if (match.userId === currentUserId) {
        setError('Bạn không thể tự nhận kèo của chính mình!');
        setIsSubmitting(false);
        return;
      }

      await axiosClient.post('/match-requests', {
        postId: match.id,
        requesterId: currentUserId,
        message: message
      });

      alert('Đã gửi yêu cầu nhận kèo và tạo phòng chat thành công!');
      onConfirm();
    } catch (err) {
      console.error(err);
      const backendMessage = err.response?.data?.message || err.response?.data;
      
      if (backendMessage && typeof backendMessage === 'string') {
        setError(backendMessage);
      } else {
        setError('Không thể gửi yêu cầu nhận kèo lúc này. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center transition-all duration-300">
        
        <div className="w-16 h-16 bg-[#e8f9eb] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <div className="w-6 h-6 bg-[#60D86E] rounded-full animate-pulse"></div>
        </div>
        
        <h3 className="text-xl font-bold text-[#1a202c] mb-2">Xác Nhận Nhận Kèo</h3>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-xs mb-4 text-left border border-red-100 font-medium">
            {error}
          </div>
        )}

        <p className="text-[#4a5568] mb-4 text-sm">
          Nhập lời nhắn gửi đến chủ bài đăng:
        </p>
        
        <textarea 
          className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#60D86E] outline-none mb-6 resize-none h-28 bg-gray-50 focus:bg-white transition-all text-[#1a202c]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ví dụ: Đội mình 7 người, trình độ trung bình..."
          disabled={isSubmitting}
        />

        <div className="flex gap-4">
          <button 
            type="button" 
            className="w-full rounded-full bg-gray-100 hover:bg-gray-200 py-3.5 font-bold text-sm text-[#4a5568] transition-all duration-200 active:scale-95 hover:-translate-y-0.5 disabled:opacity-50" 
            onClick={onClose} 
            disabled={isSubmitting}
          >
            Hủy
          </button>
          
          <button 
            type="button" 
            className="w-full rounded-full bg-[#60D86E] hover:bg-[#45c45a] shadow-md py-3.5 font-bold text-white text-sm transition-all duration-200 active:scale-95 hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none" 
            onClick={handleApplyMatch} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmApplyModal;