import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import fieldService from '../../services/fieldService'

const FIELD_TYPES = [
  { value: 'FIVE_A_SIDE', label: 'Sân 5' },
  { value: 'SEVEN_A_SIDE', label: 'Sân 7' },
]

const SLOT_STATUSES = [
  { value: 'AVAILABLE', label: 'Trống', badge: 'bg-green-100 text-green-700' },
  { value: 'PENDING', label: 'Giữ chỗ', badge: 'bg-amber-100 text-amber-700' },
  { value: 'BOOKED', label: 'Đã đặt', badge: 'bg-blue-100 text-blue-700' },
]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2)
  const minute = index % 2 === 0 ? 0 : 30
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  return { value, label: value }
})

const EMPTY_FIELD_FORM = {
  name: '',
  type: 'FIVE_A_SIDE',
  coverImage: '',
}

function toDisplayDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (num) => String(num).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

function toInputTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (num) => String(num).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function createDefaultSlotForm() {
  const start = new Date()
  start.setHours(18, 0, 0, 0)

  const end = new Date(start)
  end.setHours(19, 30, 0, 0)

  return {
    date: toDisplayDate(start),
    startTime: toInputTime(start),
    endTime: toInputTime(end),
    price: '',
    status: 'AVAILABLE',
  }
}

function formatDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function getPriceDigits(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.trunc(value))

  const raw = String(value ?? '')
  if (/^\d+\.\d{1,2}$/.test(raw)) return String(Math.trunc(Number(raw)))
  return raw.replace(/\D/g, '')
}

function formatPriceInput(value) {
  const digits = getPriceDigits(value)
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function parsePriceInput(value) {
  return Number(getPriceDigits(value)) || 0
}

function parseDisplayDate(value) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''

  const [, day, month, year] = match
  const isoDate = `${year}-${month}-${day}`
  const date = new Date(`${isoDate}T00:00:00`)

  if (
    Number.isNaN(date.getTime())
    || date.getFullYear() !== Number(year)
    || date.getMonth() + 1 !== Number(month)
    || date.getDate() !== Number(day)
  ) {
    return ''
  }

  return isoDate
}

function buildSlotDateTime(date, time) {
  if (!date || !time) return ''
  const isoDate = parseDisplayDate(date)
  if (!isoDate) return ''
  return `${isoDate}T${time.length === 5 ? `${time}:00` : time}`
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const pad = (num) => String(num).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatSlotRange(slot) {
  return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
}

function getFieldTypeLabel(type) {
  return FIELD_TYPES.find((item) => item.value === type)?.label || type || 'Chưa phân loại'
}

function getSlotStatus(status) {
  return SLOT_STATUSES.find((item) => item.value === status) || SLOT_STATUSES[0]
}

function FieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M3 18h18" />
      <path d="M7 6v12" />
      <path d="M17 6v12" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  )
}

function FieldForm({ form, onChange, onSubmit, onReset, editing, submitting }) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-[#1a202c]">{editing ? 'Cập nhật sân' : 'Tạo sân mới'}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Thông tin cơ bản và ảnh bìa</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {editing ? 'Hủy sửa' : 'Đóng'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1.5">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Tên sân</span>
          <input
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            placeholder="VD: Sân số 1"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all"
            disabled={submitting}
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Loại sân</span>
          <select
            value={form.type}
            onChange={(event) => onChange({ ...form, type: event.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all"
            disabled={submitting}
          >
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-1.5 block">
        <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Ảnh bìa</span>
        <input
          value={form.coverImage}
          onChange={(event) => onChange({ ...form, coverImage: event.target.value })}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all"
          disabled={submitting}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#60D86E] text-white text-sm font-bold hover:bg-[#45c45a] disabled:opacity-60 transition-colors"
      >
        <PlusIcon />
        {submitting ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo sân'}
      </button>
    </form>
  )
}

function SlotForm({ form, onChange, onSubmit, onReset, editing, disabled, submitting }) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-[#1a202c]">{editing ? 'Cập nhật khung giờ' : 'Thêm khung giờ'}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Giờ hoạt động, giá thuê và trạng thái</p>
        </div>
        {editing && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Hủy sửa
          </button>
        )}
      </div>

      <fieldset disabled={disabled || submitting} className="grid grid-cols-1 lg:grid-cols-[180px_1fr_160px_160px] gap-4">
        <label className="space-y-1.5">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày</span>
          <div className="grid grid-cols-[1fr_44px] gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="01/06/2026"
              value={form.date}
              onChange={(event) => onChange({ ...form, date: formatDateInput(event.target.value) })}
              className="w-full min-w-0 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all"
            />
            <span className="relative inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 hover:border-[#60D86E] hover:text-[#60D86E] transition-colors">
              <CalendarIcon />
              <input
                type="date"
                value={parseDisplayDate(form.date)}
                onChange={(event) => onChange({ ...form, date: toDisplayDate(event.target.value) })}
                aria-label="Chọn ngày từ lịch"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </span>
          </div>
        </label>

        <div className="space-y-1.5">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Khung giờ</span>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-[#60D86E]/30 focus-within:border-[#60D86E] transition-all">
            <select
              value={form.startTime}
              onChange={(event) => onChange({ ...form, startTime: event.target.value })}
              aria-label="Giờ bắt đầu"
              className="min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-[#1a202c] focus:outline-none"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={`start-${time.value}`} value={time.value}>{time.label}</option>
              ))}
            </select>
            <span className="text-xs font-bold text-gray-400">đến</span>
            <select
              value={form.endTime}
              onChange={(event) => onChange({ ...form, endTime: event.target.value })}
              aria-label="Giờ kết thúc"
              className="min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-[#1a202c] focus:outline-none"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={`end-${time.value}`} value={time.value}>{time.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="space-y-1.5">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Giá thuê</span>
          <input
            type="text"
            inputMode="numeric"
            value={form.price}
            onChange={(event) => onChange({ ...form, price: formatPriceInput(event.target.value) })}
            placeholder="300.000"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all"
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Trạng thái</span>
          <select
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-[#1a202c] focus:outline-none focus:ring-2 focus:ring-[#60D86E]/30 focus:border-[#60D86E] transition-all"
          >
            {SLOT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={disabled || submitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a202c] text-white text-sm font-bold hover:bg-black disabled:opacity-60 transition-colors"
      >
        <PlusIcon />
        {submitting ? 'Đang lưu...' : editing ? 'Lưu khung giờ' : 'Thêm khung giờ'}
      </button>
    </form>
  )
}

export default function OwnerFieldsPage() {
  const cachedFields = fieldService.peekFields()
  const [fields, setFields] = useState(() => cachedFields || [])
  const [fieldDetails, setFieldDetails] = useState(() => {
    if (!cachedFields) return {}

    return Object.fromEntries(
      cachedFields
        .map((field) => [field.id, fieldService.peekFieldDetail(field.id)])
        .filter(([, detail]) => Boolean(detail))
        .map(([id, detail]) => [id, { ...detail, timeSlots: detail.timeSlots || [] }])
    )
  })
  const [selectedFieldId, setSelectedFieldId] = useState(() => cachedFields?.[0]?.id || null)
  const [fieldForm, setFieldForm] = useState(EMPTY_FIELD_FORM)
  const [slotForm, setSlotForm] = useState(createDefaultSlotForm)
  const [editingFieldId, setEditingFieldId] = useState(null)
  const [editingSlotId, setEditingSlotId] = useState(null)
  const [showFieldForm, setShowFieldForm] = useState(false)
  const [loading, setLoading] = useState(() => !cachedFields)
  const [detailLoading, setDetailLoading] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const slotFormRef = useRef(null)

  const selectedField = useMemo(
    () => {
      const baseField = fields.find((field) => field.id === selectedFieldId) || fields[0] || null
      if (!baseField) return null

      const detail = fieldDetails[baseField.id]
      return detail ? { ...baseField, ...detail, timeSlots: detail.timeSlots || [] } : baseField
    },
    [fieldDetails, fields, selectedFieldId]
  )

  const selectedFieldDetailLoading = Boolean(selectedField?.id && detailLoading === selectedField.id)

  const sortedSlots = useMemo(() => {
    return [...(selectedField?.timeSlots || [])].sort(
      (a, b) => new Date(a.startTime || 0) - new Date(b.startTime || 0)
    )
  }, [selectedField])

  const loadFieldDetail = useCallback(async (fieldId) => {
    if (!fieldId) return null

    const cachedDetail = fieldService.peekFieldDetail(fieldId)
    if (cachedDetail) {
      setFieldDetails((prev) => (
        prev[fieldId]
          ? prev
          : { ...prev, [fieldId]: { ...cachedDetail, timeSlots: cachedDetail.timeSlots || [] } }
      ))
    }

    setDetailLoading(cachedDetail ? '' : fieldId)
    try {
      const detail = await fieldService.getFieldById(fieldId)
      setFieldDetails((prev) => ({ ...prev, [fieldId]: { ...detail, timeSlots: detail.timeSlots || [] } }))
      return detail
    } catch (detailError) {
      console.error('Owner field detail load error:', detailError)
      setError('Không tải được khung giờ của sân đang chọn.')
      return null
    } finally {
      setDetailLoading((current) => (current === fieldId ? '' : current))
    }
  }, [])

  const loadFields = useCallback(async (preferredFieldId = '') => {
    setLoading(!fieldService.peekFields())
    setError('')
    try {
      const fieldList = await fieldService.getFields()

      setFields(fieldList)
      setFieldDetails((prev) => {
        const validIds = new Set(fieldList.map((field) => field.id))
        return Object.fromEntries(Object.entries(prev).filter(([id]) => validIds.has(id)))
      })
      setSelectedFieldId((currentId) => {
        if (preferredFieldId && fieldList.some((field) => field.id === preferredFieldId)) return preferredFieldId
        if (fieldList.some((field) => field.id === currentId)) return currentId
        return fieldList[0]?.id || null
      })
    } catch (loadError) {
      console.error('Owner fields load error:', loadError)
      setError('Không tải được danh sách sân.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFields()
  }, [loadFields])

  useEffect(() => {
    if (selectedFieldId && !fieldDetails[selectedFieldId]) {
      loadFieldDetail(selectedFieldId)
    }
  }, [fieldDetails, loadFieldDetail, selectedFieldId])

  const resetFieldForm = () => {
    setEditingFieldId(null)
    setFieldForm(EMPTY_FIELD_FORM)
    setShowFieldForm(false)
  }

  const resetSlotForm = () => {
    setEditingSlotId(null)
    setSlotForm(createDefaultSlotForm())
  }

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }

  const handleFieldSubmit = async (event) => {
    event.preventDefault()
    const name = fieldForm.name.trim()
    if (!name) {
      setError('Vui lòng nhập tên sân.')
      return
    }

    setActionLoading('field')
    setError('')
    try {
      const payload = {
        name,
        type: fieldForm.type,
        coverImage: fieldForm.coverImage.trim(),
      }

      if (editingFieldId) {
        const updated = await fieldService.updateField(editingFieldId, payload)
        setFields((prev) => prev.map((field) => (field.id === editingFieldId ? { ...field, ...updated } : field)))
        setFieldDetails((prev) => (
          prev[editingFieldId]
            ? { ...prev, [editingFieldId]: { ...prev[editingFieldId], ...updated } }
            : prev
        ))
        showNotice('Đã cập nhật sân.')
      } else {
        const created = await fieldService.createField(payload)
        setFields((prev) => [created, ...prev])
        setFieldDetails((prev) => ({ ...prev, [created.id]: { ...created, timeSlots: [] } }))
        setSelectedFieldId(created.id)
        showNotice('Đã tạo sân mới.')
      }

      resetFieldForm()
    } catch (submitError) {
      console.error('Owner field submit error:', submitError)
      setError(submitError?.response?.data?.message || 'Không lưu được thông tin sân.')
    } finally {
      setActionLoading('')
    }
  }

  const handleEditField = (field) => {
    setEditingFieldId(field.id)
    setFieldForm({
      name: field.name || '',
      type: field.type || 'FIVE_A_SIDE',
      coverImage: field.coverImage || '',
    })
    setSelectedFieldId(field.id)
    setShowFieldForm(true)
  }

  const handleCreateFieldClick = () => {
    setEditingFieldId(null)
    setFieldForm(EMPTY_FIELD_FORM)
    setShowFieldForm(true)
  }

  const handleDeleteField = async (field) => {
    const ok = window.confirm(`Xóa ${field.name || 'sân này'}? Các khung giờ liên quan cũng sẽ bị xóa.`)
    if (!ok) return

    setActionLoading(`field-delete-${field.id}`)
    setError('')
    try {
      await fieldService.deleteField(field.id)
      const remainingFields = fields.filter((item) => item.id !== field.id)
      setFields(remainingFields)
      setFieldDetails((prev) => {
        const next = { ...prev }
        delete next[field.id]
        return next
      })
      if (selectedFieldId === field.id) setSelectedFieldId(remainingFields[0]?.id || null)
      if (editingFieldId === field.id) resetFieldForm()
      showNotice('Đã xóa sân.')
    } catch (deleteError) {
      console.error('Owner field delete error:', deleteError)
      setError(deleteError?.response?.data?.message || 'Không xóa được sân.')
    } finally {
      setActionLoading('')
    }
  }

  const handleSlotSubmit = async (event) => {
    event.preventDefault()
    if (!selectedField) {
      setError('Vui lòng chọn một sân trước.')
      return
    }
    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime || !slotForm.price) {
      setError('Vui lòng chọn ngày, khung giờ và giá thuê.')
      return
    }

    const startDateTime = buildSlotDateTime(slotForm.date, slotForm.startTime)
    const endDateTime = buildSlotDateTime(slotForm.date, slotForm.endTime)

    if (!startDateTime || !endDateTime) {
      setError('Ngày phải đúng định dạng dd/mm/yyyy, ví dụ 01/06/2026.')
      return
    }

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setError('Giờ kết thúc phải sau giờ bắt đầu trong cùng một ngày.')
      return
    }

    setActionLoading('slot')
    setError('')
    try {
      const payload = {
        startTime: startDateTime,
        endTime: endDateTime,
        price: parsePriceInput(slotForm.price),
        status: slotForm.status,
      }

      if (editingSlotId) {
        await fieldService.updateTimeSlot(selectedField.id, editingSlotId, payload)
        showNotice('Đã cập nhật khung giờ.')
      } else {
        await fieldService.createTimeSlot(selectedField.id, payload)
        showNotice('Đã thêm khung giờ.')
      }

      resetSlotForm()
      await loadFieldDetail(selectedField.id)
    } catch (submitError) {
      console.error('Owner slot submit error:', submitError)
      setError(submitError?.response?.data?.message || 'Không lưu được khung giờ.')
    } finally {
      setActionLoading('')
    }
  }

  const handleEditSlot = (slot) => {
    setEditingSlotId(slot.id)
    setSlotForm({
      date: toDisplayDate(slot.startTime),
      startTime: toInputTime(slot.startTime),
      endTime: toInputTime(slot.endTime),
      price: formatPriceInput(slot.price ?? ''),
      status: slot.status || 'AVAILABLE',
    })
    window.requestAnimationFrame(() => {
      slotFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleDeleteSlot = async (slot) => {
    if (!selectedField) return
    const ok = window.confirm('Xóa khung giờ này?')
    if (!ok) return

    setActionLoading(`slot-delete-${slot.id}`)
    setError('')
    try {
      await fieldService.deleteTimeSlot(selectedField.id, slot.id)
      if (editingSlotId === slot.id) resetSlotForm()
      showNotice('Đã xóa khung giờ.')
      await loadFieldDetail(selectedField.id)
    } catch (deleteError) {
      console.error('Owner slot delete error:', deleteError)
      setError(deleteError?.response?.data?.message || 'Không xóa được khung giờ.')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <main className="pt-24 pb-20 min-h-screen bg-[#f8faf8]">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to="/" className="text-sm text-gray-400 hover:text-blue-500 font-medium transition-colors">
              Quay lại trang tổng quan
            </Link>
            <h1 className="text-2xl font-extrabold text-[#1a202c] mt-1">Quản lý sân</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading
                ? 'Đang tải dữ liệu...'
                : selectedField
                  ? `${fields.length} sân · ${selectedFieldDetailLoading ? 'đang tải khung giờ' : `${selectedField.timeSlots?.length || 0} khung giờ của sân đang chọn`}`
                  : `${fields.length} sân`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateFieldClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#60D86E] text-white text-sm font-bold hover:bg-[#45c45a] transition-colors"
          >
            <PlusIcon />
            Tạo sân
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}
        {notice && (
          <div className="bg-green-50 border border-green-100 text-green-700 rounded-2xl px-4 py-3 text-sm font-medium">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-6">
          <aside className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-[#1a202c]">Danh sách sân</h2>
                <span className="text-xs font-bold text-gray-400">{fields.length}</span>
              </div>

              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((item) => <div key={item} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
                </div>
              ) : fields.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-gray-400 font-medium">Chưa có sân nào.</p>
                </div>
              ) : (
                <div className="p-3 space-y-2 max-h-[560px] overflow-y-auto">
                  {fields.map((field) => {
                    const selected = selectedField?.id === field.id
                    const deleting = actionLoading === `field-delete-${field.id}`
                    const slotCount = fieldDetails[field.id]?.timeSlots?.length
                    const slotLabel = detailLoading === field.id
                      ? 'Đang tải khung giờ'
                      : slotCount == null ? 'Chọn để tải khung giờ' : `${slotCount} khung giờ`
                    return (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => setSelectedFieldId(field.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all ${
                          selected
                            ? 'bg-[#e8f9eb] border-[#60D86E]/40 shadow-sm'
                            : 'bg-white border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden flex items-center justify-center text-[#60D86E] border border-gray-100 flex-shrink-0">
                            {field.coverImage ? (
                              <img src={field.coverImage} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            ) : (
                              <FieldIcon />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#1a202c] truncate">{field.name || 'Sân bóng'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{getFieldTypeLabel(field.type)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{slotLabel}</p>
                          </div>
                        </div>
                        {selected && (
                          <div className="flex gap-2 mt-3">
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation()
                                handleEditField(field)
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') handleEditField(field)
                              }}
                              className="inline-flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-xl bg-white text-xs font-bold text-blue-600 border border-blue-100 hover:bg-blue-50"
                            >
                              <EditIcon />
                              Sửa
                            </span>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteField(field)
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') handleDeleteField(field)
                              }}
                              className="inline-flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-xl bg-white text-xs font-bold text-red-500 border border-red-100 hover:bg-red-50"
                            >
                              <TrashIcon />
                              {deleting ? 'Đang xóa' : 'Xóa'}
                            </span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateFieldClick}
              className="w-full bg-white rounded-3xl border border-dashed border-gray-200 p-6 text-center text-sm font-bold text-gray-400 hover:border-[#60D86E] hover:text-[#60D86E] transition-colors"
            >
              Bấm để mở form tạo sân mới
            </button>
          </aside>

          <section className="space-y-4">
            <div ref={slotFormRef} className="scroll-mt-28">
              <SlotForm
                form={slotForm}
                onChange={setSlotForm}
                onSubmit={handleSlotSubmit}
                onReset={resetSlotForm}
                editing={!!editingSlotId}
                disabled={!selectedField}
                submitting={actionLoading === 'slot'}
              />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {!selectedField ? (
                <div className="text-center py-16 px-4">
                  <p className="text-gray-400 font-medium">Chọn hoặc tạo sân để quản lý khung giờ.</p>
                </div>
              ) : (
                <>
                  <div className="relative h-56 bg-[#e8f9eb]">
                    {selectedField.coverImage ? (
                      <img src={selectedField.coverImage} alt="" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#60D86E]">
                        <FieldIcon />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute left-5 right-5 bottom-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{getFieldTypeLabel(selectedField.type)}</p>
                        <h2 className="text-2xl font-black text-white truncate">{selectedField.name || 'Sân bóng'}</h2>
                      </div>
                      <span className="self-start sm:self-auto bg-white text-[#1a202c] text-xs font-bold px-3 py-1.5 rounded-full">
                        {selectedFieldDetailLoading ? 'Đang tải...' : `${selectedField.timeSlots?.length || 0} khung giờ`}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h2 className="font-bold text-lg text-[#1a202c]">Khung giờ</h2>
                      <span className="font-mono text-xs text-gray-400">#{selectedField.id?.slice(0, 8)?.toUpperCase()}</span>
                    </div>

                    {selectedFieldDetailLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : sortedSlots.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-400 font-medium">Chưa có khung giờ nào.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-400 font-bold border-b border-gray-100">
                              <th className="py-3 pr-4">Ngày</th>
                              <th className="py-3 pr-4">Khung giờ</th>
                              <th className="py-3 pr-4">Giá</th>
                              <th className="py-3 pr-4">Trạng thái</th>
                              <th className="py-3 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedSlots.map((slot) => {
                              const status = getSlotStatus(slot.status)
                              const deleting = actionLoading === `slot-delete-${slot.id}`
                              return (
                                <tr key={slot.id} className="border-b border-gray-50 last:border-0">
                                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{formatDate(slot.startTime)}</td>
                                  <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{formatSlotRange(slot)}</td>
                                  <td className="py-3 pr-4 font-bold text-[#60D86E] whitespace-nowrap">{formatCurrency(slot.price)}</td>
                                  <td className="py-3 pr-4 whitespace-nowrap">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.badge}`}>
                                      {status.label}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right">
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleEditSlot(slot)}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                        aria-label="Sửa khung giờ"
                                      >
                                        <EditIcon />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSlot(slot)}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                        aria-label="Xóa khung giờ"
                                      >
                                        {deleting ? (
                                          <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                        ) : (
                                          <TrashIcon />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </section>

      {showFieldForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Đóng form"
            onClick={resetFieldForm}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-3xl max-h-[calc(100vh-48px)] overflow-y-auto rounded-3xl shadow-2xl">
            <FieldForm
              form={fieldForm}
              onChange={setFieldForm}
              onSubmit={handleFieldSubmit}
              onReset={resetFieldForm}
              editing={!!editingFieldId}
              submitting={actionLoading === 'field'}
            />
          </div>
        </div>
      )}
    </main>
  )
}
