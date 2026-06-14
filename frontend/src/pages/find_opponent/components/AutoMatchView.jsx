import React, { useState } from 'react';
import { FaRobot, FaTimes, FaCheck, FaUserCircle, FaCheckCircle, FaHourglassHalf, FaSearch } from 'react-icons/fa';
import MatchCard from './common/MatchCard';

const ConfirmApplyModal = ({ isOpen, match, onClose, onConfirm, isProcessingMatch }) => {
  const [message, setMessage] = useState('Chào bạn, đội mình muốn nhận kèo này!');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setError('');
      setMessage('Chào bạn, đội mình muốn nhận kèo này!');
    }
  }, [isOpen]);

  if (!isOpen || !match) return null;

  const handleSubmit = () => {
    if (!message.trim()) {
      setError('Vui lòng nhập lời nhắn!');
      return;
    }
    onConfirm(message);
    onClose();
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
          disabled={isProcessingMatch}
        />

        <div className="flex gap-4">
          <button 
            type="button" 
            className="w-full rounded-full bg-gray-100 hover:bg-gray-200 py-3.5 font-bold text-sm text-[#4a5568] transition-all duration-200 active:scale-95 hover:-translate-y-0.5 disabled:opacity-50" 
            onClick={onClose} 
            disabled={isProcessingMatch}
          >
            Hủy
          </button>
          
          <button 
            type="button" 
            className="w-full rounded-full bg-[#60D86E] hover:bg-[#45c45a] shadow-md py-3.5 font-bold text-white text-sm transition-all duration-200 active:scale-95 hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none" 
            onClick={handleSubmit} 
            disabled={isProcessingMatch}
          >
            {isProcessingMatch ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AutoMatchView = ({
  aiStep,
  aiResults = [],
  pendingRequest,
  fields = [],
  isPolling,
  isProcessingMatch,
  onCancelSearch,
  onAcceptLiveMatch,
  onDeclineLiveMatch,
  onAcceptPending,
  onRejectPending,
  onAcceptStaticMatch,
  foundLivePost
}) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleOpenConfirm = (match) => {
    setSelectedMatch(match);
    setIsConfirmOpen(true);
  };

  const handleConfirmApply = (message) => {
    if (selectedMatch) {
      onAcceptStaticMatch(selectedMatch.id, message);
    }
    setIsConfirmOpen(false);
    setSelectedMatch(null);
  };

  const translateSkillLevel = (level) => {
    switch(level) {
      case 'BEGINNER': return 'Tân binh / Vui vẻ';
      case 'INTERMEDIATE': return 'Nghiệp dư / Khá';
      case 'ADVANCED': return 'Chuyên nghiệp / Tốt';
      default: return level || 'Mọi trình độ';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh] relative font-sans antialiased">
      
      {/* MODAL: MATCH_FOUND */}
      {aiStep === 'MATCH_FOUND' && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-3xl transition-all duration-300">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-lg border border-gray-100 relative overflow-hidden animate-fade-in-up">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-[#60D86E]"></div>
            
            <h2 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-widest uppercase mt-4">
              KÈO TỚI!
            </h2>
            <p className="text-[#4a5568] font-medium mb-6">
              Hệ thống đã kết nối thành công với một đối thủ trực tuyến.
            </p>
            
            <div className="w-24 h-24 bg-[#e8f9eb] text-[#60D86E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FaUserCircle className="text-6xl" />
            </div>

            {foundLivePost && (
              <div className="bg-[#f8faf8] p-5 rounded-3xl w-full border border-gray-100 mb-6 text-left">
                <p className="text-sm text-[#1a202c] font-bold mb-1">
                  Cầu thủ: <span className="font-normal uppercase text-[#4a5568]">{foundLivePost.userId?.substring(0, 8)}</span>
                </p>
                <p className="text-sm text-[#1a202c] font-bold mb-1">
                  Sân: <span className="font-normal text-[#4a5568]">{fields.find(f => f.id === foundLivePost.fieldId)?.name || 'Mọi sân'}</span>
                </p>
                <p className="text-sm text-[#1a202c] font-bold mb-3">
                  Trình độ: <span className="font-semibold text-blue-600">{translateSkillLevel(foundLivePost.skillLevel)}</span>
                </p>
                
                <div className="text-sm text-[#4a5568] font-medium pt-2 border-t border-gray-200/60 whitespace-pre-wrap flex items-start gap-2">
                  <FaCheckCircle className="text-[#60D86E] mt-0.5 flex-shrink-0" /> 
                  <span>{foundLivePost.message?.replace('[LIVE_MATCH]', '').trim()}</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                type="button"
                disabled={isProcessingMatch}
                onClick={onDeclineLiveMatch}
                className={`flex-1 py-3 text-base border border-gray-200 text-[#4a5568] bg-gray-50 hover:bg-gray-100 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 active:scale-95 ${isProcessingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaTimes className="inline mr-2" /> Bỏ Qua
              </button>
              <button
                type="button"
                disabled={isProcessingMatch}
                onClick={onAcceptLiveMatch}
                className={`flex-1 py-3 text-base bg-[#60D86E] hover:bg-[#45c45a] text-white rounded-full font-semibold shadow-md transition-all duration-200 hover:-translate-y-1 active:scale-95 ${isProcessingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessingMatch ? <FaHourglassHalf className="inline mr-2 animate-spin" /> : <FaCheck className="inline mr-2" />} 
                {isProcessingMatch ? 'Đang Xử Lý...' : 'Chốt Kèo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECEIVE_REQUEST */}
      {aiStep === 'RECEIVE_REQUEST' && pendingRequest && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-3xl transition-all duration-300">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-lg border border-gray-100 relative overflow-hidden animate-fade-in-up">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            
            <h2 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-widest uppercase mt-4">
              YÊU CẦU GHÉP!
            </h2>
            <p className="text-[#4a5568] font-medium mb-6">
              User <span className="font-bold text-[#1a202c] uppercase">{pendingRequest.requesterId.substring(0, 8)}</span> đã chốt kèo với bạn.
            </p>
            
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FaUserCircle className="text-6xl" />
            </div>
            
            <div className="bg-[#f8faf8] p-4 rounded-3xl w-full border border-gray-100 mb-6 text-[#4a5568] font-medium text-sm">
              <span>{pendingRequest.message}</span>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                disabled={isProcessingMatch}
                onClick={onRejectPending}
                className={`flex-1 py-3 text-base border border-gray-200 text-[#4a5568] bg-gray-50 hover:bg-gray-100 rounded-full font-semibold transition-all duration-200 hover:-translate-y-1 active:scale-95 ${isProcessingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaTimes className="inline mr-2" /> Từ Chối
              </button>
              <button
                type="button"
                disabled={isProcessingMatch}
                onClick={onAcceptPending}
                className={`flex-1 py-3 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-md transition-all duration-200 hover:-translate-y-1 active:scale-95 ${isProcessingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessingMatch ? <FaHourglassHalf className="inline mr-2 animate-spin" /> : <FaCheck className="inline mr-2" />}
                {isProcessingMatch ? 'Đang Xử Lý...' : 'Đồng Ý'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:w-1/3 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden p-6">
        
        <div className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${aiStep === 'WAITING_OPPONENT' ? 'bg-orange-400 animate-pulse' : (isPolling ? 'bg-[#60D86E] animate-pulse' : 'bg-gray-200')}`}></div>
        
        <div className="relative mb-8 z-10">
          <div className={`w-32 h-32 border-4 rounded-full ${aiStep === 'WAITING_OPPONENT' ? 'border-orange-500/20' : 'border-gray-100'}`}></div>
          <div className={`w-32 h-32 border-4 rounded-full border-t-transparent absolute top-0 left-0 transition-all duration-300 ${aiStep === 'WAITING_OPPONENT' ? 'border-orange-500' : (isPolling ? 'border-[#60D86E] animate-spin' : 'border-gray-300')}`}></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            {aiStep === 'WAITING_OPPONENT' ? (
              <FaHourglassHalf className="text-5xl text-orange-500 animate-spin" />
            ) : (
              <FaSearch className={`text-5xl transition-all duration-300 ${isPolling ? 'text-[#60D86E] animate-pulse' : 'text-gray-300'}`} />
            )}
          </div>
        </div>
        
        {aiStep === 'WAITING_OPPONENT' ? (
          <>
            <h4 className="font-bold text-[#1a202c] text-xl mb-2 z-10 text-center tracking-tight">Đang Chờ Phản Hồi</h4>
            <p className="text-[#4a5568] text-sm text-center mb-8 z-10 px-4 leading-relaxed">
              Bạn đã đồng ý. Hệ thống đang đợi đối phương xác nhận để chuyển vào phòng tin nhắn.
            </p>
          </>
        ) : (
          <>
            <h4 className="font-bold text-[#1a202c] text-xl mb-2 z-10 text-center tracking-tight">
              {isPolling ? 'Đang Tìm Kiếm...' : 'Đã Tìm Xong'}
            </h4>
            <p className="text-[#4a5568] text-sm text-center mb-8 z-10 px-4 leading-relaxed">
              {isPolling ? 'Đang tìm các đối thủ trực tuyến phù hợp nhất với bạn.' : 'Đã tạm dừng. Bạn có thể chốt các kèo phía trên hoặc thử tìm lại.'}
            </p>
          </>
        )}

        <button 
          type="button"
          className={`rounded-full px-6 py-3 flex items-center gap-2 z-10 shadow-sm font-semibold transition-all duration-200 hover:-translate-y-1 active:scale-95 ${isPolling ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-gray-100 text-[#4a5568] border border-gray-200 hover:bg-gray-200'}`} 
          onClick={onCancelSearch}
        >
          <FaTimes /> {isPolling ? 'Hủy Tìm Kiếm' : 'Thoát'}
        </button>
      </div>

      <div className="lg:w-2/3 bg-[#f8faf8] rounded-3xl border border-gray-100 p-6 flex flex-col shadow-sm">
        <h3 className="font-bold text-[#1a202c] text-lg mb-6 flex items-center gap-2 border-b border-gray-200/60 pb-4 tracking-tight">
          <FaRobot className="text-[#60D86E]"/> Đề Xuất Phù Hợp ({aiResults.length})
        </h3>
        
        {aiResults.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#4a5568]/40">
            <FaSearch className="text-6xl mb-4 opacity-20" />
            <p className="text-base text-[#4a5568] font-medium text-center">Không có bài đăng tĩnh nào khớp. Đợi radar quét người dùng trực tuyến...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto pb-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
            {aiResults.slice(0, 4).map((res, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <div className="bg-[#e8f9eb] p-3 rounded-2xl border border-gray-100/50 relative">
                  <FaSearch className="absolute -top-2.5 -left-2 text-xl text-[#60D86E] bg-white rounded-full shadow-sm" />
                  <p className="text-xs text-[#4a5568] italic ml-4 font-medium">
                    {res.aiExplanation}
                  </p>
                </div>
                <MatchCard 
                  match={res.fullMatch} 
                  fieldName={fields.find(f => f.id === res.fullMatch.fieldId)?.name}
                  onApply={() => {
                    if (!isProcessingMatch) handleOpenConfirm(res.fullMatch);
                  }} 
                  className="rounded-3xl shadow-sm border border-gray-100" 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmApplyModal
        isOpen={isConfirmOpen}
        match={selectedMatch}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmApply}
        isProcessingMatch={isProcessingMatch}
      />
    </div>
  );
};

export default AutoMatchView;