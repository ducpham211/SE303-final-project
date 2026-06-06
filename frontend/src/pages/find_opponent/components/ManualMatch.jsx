import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axiosClient from '../../../api/axiosClient';

const ManualMatchModal = ({ isOpen, onClose, onSubmit, fields }) => {
  const [newPost, setNewPost] = useState({
    message: '', 
    date: '', 
    timeStartStr: '18:00', 
    timeEndStr: '19:30',   
    skillLevel: 'BEGINNER', 
    costSharing: '50-50',
    postType: 'FIND_OPPONENT',
    fieldId: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const standardSlots = [
    { start: '06:00', end: '07:30' },
    { start: '07:30', end: '09:00' },
    { start: '09:00', end: '10:30' },
    { start: '10:30', end: '12:00' },
    { start: '12:00', end: '13:30' },
    { start: '13:30', end: '15:00' },
    { start: '15:00', end: '16:30' },
    { start: '16:30', end: '18:00' },
    { start: '18:00', end: '19:30' },
    { start: '19:30', end: '21:00' },
    { start: '21:00', end: '22:30' },
    { start: '22:00', end: '23:30' }
  ];

  const extractTime = (dateTime) => {
    if (!dateTime) return '';
    if (Array.isArray(dateTime)) {
        const hour = (dateTime[3] || 0).toString().padStart(2, '0');
        const minute = (dateTime[4] || 0).toString().padStart(2, '0');
        return `${hour}:${minute}`;
    }
    const str = String(dateTime);
    if (str.includes('T')) return str.split('T')[1].substring(0, 5);
    if (str.includes(' ')) return str.split(' ')[1].substring(0, 5);
    if (str.includes(':')) {
        const parts = str.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return str.substring(0, 5);
  };

  const isSlotAvailable = (s) => {
    if (!s) return false;
    if (s.available !== undefined) return s.available === true;
    if (s.isAvailable !== undefined) return s.isAvailable === true;
    return s.status === 'AVAILABLE';
  };

  useEffect(() => {
    if (newPost.fieldId && newPost.date) {
      setIsLoadingSlots(true);
      axiosClient.get(`/fields/${newPost.fieldId}/availability?date=${newPost.date}`)
        .then(res => {
          const data = res.data;
          const slotsArray = Array.isArray(data) ? data : (data.availableTimeSlots || data.timeSlots || []);
          setAvailableSlots(slotsArray);
          
          const availableOnly = slotsArray.filter(isSlotAvailable);
          
          if (availableOnly.length > 0) {
            const firstAvail = availableOnly[0];
            setNewPost(prev => ({
              ...prev,
              timeStartStr: extractTime(firstAvail.startTime),
              timeEndStr: extractTime(firstAvail.endTime)
            }));
          } else {
            setNewPost(prev => ({ ...prev, timeStartStr: '', timeEndStr: '' }));
          }
        })
        .catch(err => {
          console.error(err);
          setAvailableSlots([]);
          setNewPost(prev => ({ ...prev, timeStartStr: '', timeEndStr: '' }));
        })
        .finally(() => setIsLoadingSlots(false));
    } else {
      setAvailableSlots([]);
      if (!newPost.timeStartStr && standardSlots.length > 0) {
        setNewPost(prev => ({
          ...prev,
          timeStartStr: '18:00',
          timeEndStr: '19:30'
        }));
      }
    }
  }, [newPost.fieldId, newPost.date]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newPost.timeStartStr || !newPost.timeEndStr) {
        alert('Vui lòng chọn khung giờ hợp lệ!');
        return;
    }

    let finalTimeStart = null;
    let finalTimeEnd = null;

    if (newPost.date) {
        finalTimeStart = `${newPost.date}T${newPost.timeStartStr}:00`;
        finalTimeEnd = `${newPost.date}T${newPost.timeEndStr}:00`;
    }

    const formattedPost = {
        message: newPost.message,
        date: newPost.date,
        timeStart: finalTimeStart,
        timeEnd: finalTimeEnd,
        skillLevel: newPost.skillLevel,
        costSharing: newPost.costSharing,
        postType: newPost.postType,
        fieldId: newPost.fieldId || null
    };

    onSubmit(formattedPost);

    setNewPost({ 
      message: '', date: '', timeStartStr: '18:00', timeEndStr: '19:30', 
      skillLevel: 'BEGINNER', costSharing: '50-50', postType: 'FIND_OPPONENT', fieldId: '' 
    });
  };

  const renderTimeOptions = () => {
    if (newPost.fieldId) {
      if (!newPost.date) return <option value="">Vui lòng chọn ngày trước</option>;
      if (isLoadingSlots) return <option value="">Đang tải ca trống...</option>;
      
      const availableOnly = availableSlots.filter(isSlotAvailable);
      const uniqueSlots = [];
      const seen = new Set();
      
      availableOnly.forEach((slot) => {
          const startStr = extractTime(slot.startTime);
          const endStr = extractTime(slot.endTime);
          const timeKey = `${startStr}|${endStr}`;
          
          if (!seen.has(timeKey)) {
              seen.add(timeKey);
              uniqueSlots.push({ ...slot, startStr, endStr, timeKey });
          }
      });

      if (uniqueSlots.length === 0) return <option value="">Không có ca trống nào</option>;
      
      return uniqueSlots.map((slot) => (
        <option key={slot.id || slot.timeKey} value={slot.timeKey}>
          {slot.startStr} - {slot.endStr}
        </option>
      ));
    } else {
      return standardSlots.map(s => (
        <option key={`${s.start}|${s.end}`} value={`${s.start}|${s.end}`}>{s.start} - {s.end}</option>
      ));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Đăng Tin Tìm Đối Thủ/Thành Viên</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-green-500 transition">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mục đích</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.postType} onChange={e => setNewPost({...newPost, postType: e.target.value})}>
              <option value="FIND_OPPONENT">Tìm Đối Thủ (Giao Hữu)</option>
              <option value="FIND_MEMBER">Tìm Đồng Đội (Tuyển Thành Viên)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề / Lời nhắn</label>
            <input required type="text" placeholder="VD: Giao lưu nhẹ nhàng, đá vui vẻ..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newPost.message} onChange={e => setNewPost({...newPost, message: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Sân (Không bắt buộc)</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.fieldId} onChange={e => setNewPost({...newPost, fieldId: e.target.value})}>
              <option value="">-- Đá sân tự do / Chưa quyết định --</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đá</label>
              <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm" value={newPost.date} onChange={e => setNewPost({...newPost, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white" 
                onChange={e => {
                  const val = e.target.value;
                  if (!val) {
                    setNewPost({...newPost, timeStartStr: '', timeEndStr: ''});
                    return;
                  }
                  const [start, end] = val.split('|');
                  setNewPost({...newPost, timeStartStr: start, timeEndStr: end});
                }} 
                value={newPost.timeStartStr && newPost.timeEndStr ? `${newPost.timeStartStr}|${newPost.timeEndStr}` : ""}
                disabled={!!newPost.fieldId && !newPost.date}
                required
              >
                {renderTimeOptions()}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ yêu cầu</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.skillLevel} onChange={e => setNewPost({...newPost, skillLevel: e.target.value})}>
                <option value="BEGINNER">Tân binh / Vui vẻ</option>
                <option value="INTERMEDIATE">Nghiệp dư / Khá</option>
                <option value="ADVANCED">Chuyên nghiệp / Tốt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉ lệ tiền sân</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.costSharing} onChange={e => setNewPost({...newPost, costSharing: e.target.value})}>
                <option value="50-50">50-50</option>
                <option value="60-40">60-40</option>
                <option value="70-30">70-30</option>
                <option value="Share đều">Chia đều</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-100 text-gray-700">Hủy</button>
            <button type="submit" className="w-full rounded-lg bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-50" disabled={isLoadingSlots || (!!newPost.fieldId && availableSlots.filter(isSlotAvailable).length === 0)}>Đăng Tin Ngay</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualMatchModal;