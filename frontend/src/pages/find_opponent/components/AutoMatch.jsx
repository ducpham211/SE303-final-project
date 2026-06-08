import { useState, useEffect } from 'react';
import { FaTimes, FaRobot, FaCheckCircle } from 'react-icons/fa';
import api from '../../../services/api';

const AutoMatchModal = ({ isOpen, onClose, onSubmit, fields = [] }) => {
  const [criteria, setCriteria] = useState({
    message: '', 
    date: '', 
    timeStartStr: '18:00', 
    timeEndStr: '19:30',   
    skillLevel: 'BEGINNER',
    fieldId: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isAnyTime, setIsAnyTime] = useState(true);

  const standardSlots = [
    { start: '06:00', end: '07:30' }, { start: '07:30', end: '09:00' },
    { start: '09:00', end: '10:30' }, { start: '10:30', end: '12:00' },
    { start: '12:00', end: '13:30' }, { start: '13:30', end: '15:00' },
    { start: '15:00', end: '16:30' }, { start: '16:30', end: '18:00' },
    { start: '18:00', end: '19:30' }, { start: '19:30', end: '21:00' },
    { start: '21:00', end: '22:30' }, { start: '22:00', end: '23:30' }
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

  useEffect(() => {
    if (criteria.fieldId && criteria.date && !isAnyTime) {
      setIsLoadingSlots(true); // eslint-disable-line react-hooks/set-state-in-effect
      api.get(`/fields/${criteria.fieldId}/availability?date=${criteria.date}`)
        .then(res => {
          const data = res.data;
          const slotsArray = Array.isArray(data) ? data : (data.availableTimeSlots || data.timeSlots || []);
          setAvailableSlots(slotsArray);
          
          if (slotsArray.length > 0) {
            const firstSlot = slotsArray[0];
            setCriteria(prev => ({
              ...prev,
              timeStartStr: extractTime(firstSlot.startTime),
              timeEndStr: extractTime(firstSlot.endTime)
            }));
          }
        })
        .catch(() => {
          setAvailableSlots([]);
        })
        .finally(() => setIsLoadingSlots(false));
    } else {
      setAvailableSlots([]);
      if (!criteria.timeStartStr && standardSlots.length > 0) {
        setCriteria(prev => ({
          ...prev,
          timeStartStr: '18:00',
          timeEndStr: '19:30'
        }));
      }
    }
  }, [criteria.fieldId, criteria.date, isAnyTime]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...criteria,
      date: isAnyTime ? '' : criteria.date,
      timeStartStr: isAnyTime ? '' : criteria.timeStartStr,
      timeEndStr: isAnyTime ? '' : criteria.timeEndStr
    });
  };

  const renderTimeOptions = () => {
    if (criteria.fieldId && criteria.date && !isAnyTime) {
      if (isLoadingSlots) return <option value="">Đang tải ca trống...</option>;
      
      const uniqueSlots = [];
      const seen = new Set();
      
      availableSlots.forEach((slot) => {
          const startStr = extractTime(slot.startTime);
          const endStr = extractTime(slot.endTime);
          const timeKey = `${startStr}|${endStr}`;
          
          if (!seen.has(timeKey)) {
              seen.add(timeKey);
              uniqueSlots.push({ ...slot, startStr, endStr, timeKey });
          }
      });

      if (uniqueSlots.length === 0) return <option value="">Không có ca trống</option>;
      
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
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-[#60D86E] bg-[#60D86E] text-white">
          <h3 className="text-xl font-bold flex items-center gap-2"><FaRobot className="text-2xl" /> Tự Động Ghép Trận</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả lối đá</label>
            <input required type="text" placeholder="VD: Đá ban bật, chuyền dài..." className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#60D86E] outline-none bg-gray-50 focus:bg-white transition-colors" value={criteria.message} onChange={e => setCriteria({...criteria, message: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Khu Vực Sân</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#60D86E] outline-none bg-white transition-colors" value={criteria.fieldId} onChange={e => setCriteria({...criteria, fieldId: e.target.value})}>
              <option value="">-- Mọi sân trên hệ thống --</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-[#e8f9eb] p-4 rounded-2xl border border-[#e8f9eb] shadow-sm">
             <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#e8f9eb] cursor-pointer" onClick={() => setIsAnyTime(!isAnyTime)}>
                <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isAnyTime ? 'bg-[#60D86E]' : 'bg-white border-2 border-gray-300'}`}>
                    {isAnyTime && <FaCheckCircle className="text-white text-sm" />}
                </div>
                <div className="flex-1 select-none">
                    <p className="font-bold text-[#1a202c] text-sm">Bất kỳ thời gian nào</p>
                    <p className="text-xs text-[#4a5568] mt-0.5">Ghép siêu tốc, bỏ qua rào cản ngày giờ</p>
                </div>
             </div>

             <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${isAnyTime ? 'opacity-40 pointer-events-none grayscale-[50%]' : 'opacity-100'}`}>
                <div>
                  <label className="block text-xs font-bold text-[#1a202c] mb-1">Ngày đá</label>
                  <input type="date" disabled={isAnyTime} className="w-full border border-[#e8f9eb] rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#60D86E] outline-none text-sm bg-white" value={criteria.date} onChange={e => setCriteria({...criteria, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1a202c] mb-1">Khung giờ</label>
                  <select 
                    disabled={isAnyTime}
                    className="w-full border border-[#e8f9eb] rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#60D86E] outline-none text-sm bg-white" 
                    onChange={e => {
                      const val = e.target.value;
                      if (val) {
                        const [start, end] = val.split('|');
                        setCriteria({...criteria, timeStartStr: start, timeEndStr: end});
                      }
                    }} 
                    value={criteria.timeStartStr && criteria.timeEndStr ? `${criteria.timeStartStr}|${criteria.timeEndStr}` : ""}
                  >
                    {renderTimeOptions()}
                  </select>
                </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Trình độ đối thủ</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#60D86E] outline-none bg-white transition-colors" value={criteria.skillLevel} onChange={e => setCriteria({...criteria, skillLevel: e.target.value})}>
              <option value="">-- Mọi trình độ --</option>
              <option value="BEGINNER">Tân binh / Vui vẻ</option>
              <option value="INTERMEDIATE">Nghiệp dư / Khá</option>
              <option value="ADVANCED">Chuyên nghiệp / Tốt</option>
            </select>
          </div>

          <div className="pt-2 flex gap-4">
            <button type="button" onClick={onClose} className="w-full rounded-xl bg-gray-100 hover:bg-gray-200 py-3.5 font-bold">Hủy</button>
            <button type="submit" className="w-full rounded-xl bg-[#60D86E] hover:bg-[#45c45a] shadow-lg py-3.5 font-bold text-white">Bắt Đầu Ghép</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoMatchModal;