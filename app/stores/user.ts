import { defineStore } from 'pinia';
import type { Dauroh } from '~/stores/dauroh';
import { useToastStore } from './toast';

export const useUserStore = defineStore('user', {
  state: () => ({
    upcomingDauroh: [] as Dauroh[],
    historyDauroh: [] as Dauroh[],
    isLoading: false,
  }),
  
  getters: {
    getUpcomingDauroh: (state) => state.upcomingDauroh,
    getHistoryDauroh: (state) => state.historyDauroh,
  },

  actions: {
    // digunakan setelah form registrasi diisi
    registerDauroh(registrationData: { dauroh: Dauroh, participants: { name: string }[] }) {
      const { dauroh, participants } = registrationData;
      const toastStore = useToastStore();
      
      const isAlreadyRegistered = this.upcomingDauroh.some(item => item.id === dauroh.id);
      
      if (!isAlreadyRegistered) {
        this.upcomingDauroh.unshift(dauroh);
        toastStore.showToast({
          message: `Pendaftaran untuk "${dauroh.title}" berhasil!`,
          type: 'success'
        });
      } else {
        toastStore.showToast({
          message: `Anda sudah terdaftar di dauroh ini.`,
          type: 'info'
        });
      }
    },
  }
});