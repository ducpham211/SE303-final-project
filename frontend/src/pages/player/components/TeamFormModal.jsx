import { useState, useEffect } from 'react'

/**
 * Reusable modal for creating or editing a team.
 * Props:
 *   isOpen      – boolean
 *   onClose     – () => void
 *   onSubmit    – (data: { name, description, level }) => Promise<void>
 *   initialData – { name, description, level } | null (null = create mode)
 */

const LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: 'Mới chơi', color: '#60D86E', bg: '#F0FDF4' },
  { value: 'INTERMEDIATE', label: 'Trung bình', color: '#3b82f6', bg: '#EFF6FF' },
  { value: 'ADVANCED', label: 'Phủi cứng', color: '#e23670', bg: '#FFF0F5' },
]

export default function TeamFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('BEGINNER')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!initialData

  // Sync form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '')
      setDescription(initialData.description || '')
      setLevel(initialData.level || 'BEGINNER')
    } else if (isOpen && !initialData) {
      setName('')
      setDescription('')
      setLevel('BEGINNER')
    }
    setError('')
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên đội bóng.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), level })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[fadeInScale_0.25s_ease-out]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#1a202c]">
                {isEdit ? 'Chỉnh sửa đội bóng' : 'Tạo đội bóng mới'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEdit ? 'Cập nhật thông tin đội của bạn' : 'Thiết lập hồ sơ đội bóng để ghép kèo'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Team Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Tên đội bóng
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: FC Thunder Q7"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all"
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu ngắn về đội bóng..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all resize-none"
              disabled={submitting}
            />
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Trình độ đội
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLevel(opt.value)}
                  disabled={submitting}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                    level === opt.value
                      ? 'shadow-sm'
                      : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                  style={
                    level === opt.value
                      ? { backgroundColor: opt.bg, color: opt.color, borderColor: opt.color + '40' }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#60D86E] hover:bg-[#45c45a] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo đội'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
