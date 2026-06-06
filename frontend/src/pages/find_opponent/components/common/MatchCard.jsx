import { FaFutbol, FaClock, FaCalendarAlt, FaMoneyBillWave, FaUserCircle } from 'react-icons/fa';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  if (Array.isArray(timeStr)) return `${timeStr[0].toString().padStart(2, '0')}:${(timeStr[1] || 0).toString().padStart(2, '0')}`;
  const str = String(timeStr);
  if (str.includes('T')) return str.split('T')[1].substring(0, 5);
  if (str.includes(' ')) return str.split(' ')[1].substring(0, 5);
  if (str.includes(':')) return str.substring(0, 5);
  return str;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  if (Array.isArray(dateStr)) return `${dateStr[2].toString().padStart(2, '0')}/${dateStr[1].toString().padStart(2, '0')}/${dateStr[0]}`;
  let str = String(dateStr);
  if (str.includes('T')) str = str.split('T')[0];
  else if (str.includes(' ')) str = str.split(' ')[0];
  const parts = str.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : str;
};

const translateSkillLevel = (level) => {
  switch(level) {
    case 'BEGINNER': return 'Yếu / Vui vẻ';
    case 'INTERMEDIATE': return 'Trung bình / Khá';
    case 'ADVANCED': return 'Tốt / Chuyên nghiệp';
    default: return level || 'Mọi trình độ';
  }
};

const MatchCard = ({ match, fieldName, onApply }) => {
  const displayField = fieldName ? fieldName : (match.fieldId ? `Sân ID: ${match.fieldId.substring(0, 8)}...` : 'Chưa chọn sân');

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-3xl text-gray-400" />
          <div>
            <h4 className="font-bold text-gray-800">
              {match.userId ? `User: ${match.userId.substring(0, 6)}...` : 'Người chơi ẩn danh'}
            </h4>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              match.status === 'OPENING' || match.status === 'OPEN' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {match.status || 'OPEN'}
            </span>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" title={match.message}>
        {match.message || 'Cần tìm đối giao hữu'}
      </h3>
      
      <div className="space-y-2 text-sm text-gray-600 flex-1 mb-4 border-t border-gray-50 pt-3">
        <p className="flex items-center gap-2">
          <FaFutbol className="text-green-500" />
          <span className="font-medium truncate" title={displayField}>
            {displayField}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-red-500" />
            <span>{formatDate(match.date)}</span>
          </p>
          <p className="flex items-center gap-2">
            <FaClock className="text-orange-500" />
            <span>{formatTime(match.timeStart)} - {formatTime(match.timeEnd)}</span>
          </p>
        </div>
        <p className="flex items-center gap-2 mt-2">
          <span className="font-bold text-gray-700">Trình độ:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{translateSkillLevel(match.skillLevel)}</span>
        </p>
        <p className="flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" />
          <span className="font-bold text-gray-700">Tỉ lệ chia tiền:</span>
          <span>{match.costSharing || 'Chia đều'}</span>
        </p>
      </div>

      {typeof onApply === 'function' && (
        <button
          type="button"
          onClick={onApply}
          className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 transition"
        >
          Nhận Kèo / Liên Hệ
        </button>
      )}
    </div>
  );
};

export default MatchCard;
