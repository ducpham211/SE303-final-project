import { useEffect, useState } from 'react';
import useModalStore from '../../store/useModalStore';

export default function GlobalModal() {
  const { isOpen, title, message, type, onConfirm, onCancel, close } = useModalStore();
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [render, setRender] = useState(false);
  const [animate, setAnimate] = useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setRender(true);
    } else {
      setAnimate(false);
    }
  }

  useEffect(() => {
    if (render && isOpen) {
      const timer = setTimeout(() => setAnimate(true), 30);
      return () => clearTimeout(timer);
    }
  }, [render, isOpen]);

  useEffect(() => {
    if (!isOpen && render) {
      const timer = setTimeout(() => setRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, render]);


  if (!render) return null;

  const handleConfirm = () => {
    close();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    close();
    if (onCancel) onCancel();
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        animate ? 'bg-slate-900/50 backdrop-blur-sm opacity-100' : 'bg-slate-900/0 backdrop-blur-none opacity-0'
      }`}
      onClick={handleCancel}
    >
      <div
        className={`w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-slate-100 transform transition-all duration-300 ${
          animate ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
              type === 'confirm' ? 'bg-[#e8f9eb] text-[#60D86E]' : 'bg-amber-50 text-amber-500'
            }`}
          >
            {type === 'confirm' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 leading-6">{title || 'Thông báo'}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 whitespace-pre-wrap">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {type === 'confirm' ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-full bg-[#60D86E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#45c45a] active:scale-95 shadow-md shadow-[#60D86E]/20"
              >
                Xác nhận
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto rounded-full bg-[#60D86E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#45c45a] active:scale-95 shadow-md shadow-[#60D86E]/20 text-center"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
