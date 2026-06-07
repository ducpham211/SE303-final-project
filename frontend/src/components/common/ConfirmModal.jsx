export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy', 
  isDestructive = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-slideUp">
        <div className="p-6">
          <h3 className="text-lg font-bold text-[#1a202c] mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex border-t border-gray-100">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-100"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${isDestructive ? 'text-red-500 hover:bg-red-50' : 'text-[#60D86E] hover:bg-green-50'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
