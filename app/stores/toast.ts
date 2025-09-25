import { defineStore } from 'pinia';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'danger' | 'info';
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    show: false,
    message: '',
    type: 'info',
  }),
  actions: {
    showToast(payload: { message: string, type?: 'success' | 'danger' | 'info' }) {
      this.message = payload.message;
      this.type = payload.type || 'info';
      this.show = true;

      // durasi waktu notif
      setTimeout(() => {
        this.show = false;
      }, 10000);
    },
  },
});