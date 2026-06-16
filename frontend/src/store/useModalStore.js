import { create } from 'zustand';

const useModalStore = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: 'alert', // 'alert' | 'confirm'
  onConfirm: null,
  onCancel: null,

  showAlert: (title, message, onConfirm = null) => {
    set({
      isOpen: true,
      title,
      message,
      type: 'alert',
      onConfirm,
      onCancel: null,
    });
  },

  showConfirm: (title, message, onConfirm, onCancel = null) => {
    set({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
      onCancel,
    });
  },

  close: () => {
    set({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
    });
  },
}));

export default useModalStore;
