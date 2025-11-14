import { defineStore } from 'pinia';
import type { Dauroh } from '~/stores/dauroh';
import { useToastStore } from './toast';

// 1. REVISI: Definisikan tipe Peserta dan Tiket
interface Participant {
  name: string;
  email?: string;
  gender?: string;
}

interface UserTicket {
  dauroh: Dauroh;
  participant: Participant;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    // 2. REVISI: Ubah nama state dari dauroh -> tickets
    upcomingTickets: [] as UserTicket[],
    historyTickets: [] as UserTicket[],
    isLoading: false,
  }),
  
  getters: {
    // 3. REVISI: Ubah nama getter
    getUpcomingTickets: (state) => state.upcomingTickets,
    getHistoryTickets: (state) => state.historyTickets,
  },

  actions: {
    // 4. REVISI: Ubah logika registerDauroh
    registerDauroh(registrationData: { dauroh: Dauroh, participants: Participant[] }) {
      const { dauroh, participants } = registrationData;
      const toastStore = useToastStore();

      // Hapus pengecekan 'isAlreadyRegistered' yang lama
      
      if (!dauroh || !participants || participants.length === 0) {
        toastStore.showToast({
          message: `Pendaftaran gagal: data tidak lengkap.`,
          type: 'danger'
        });
        return; // Hentikan jika data aneh
      }

      // Loop setiap peserta dan tambahkan sebagai tiket baru
      participants.forEach(participant => {
        const newTicket: UserTicket = {
          dauroh: dauroh,
          participant: participant
        };
        this.upcomingTickets.unshift(newTicket);
      });

      // Beri notifikasi sukses
      toastStore.showToast({
        message: `Pendaftaran ${participants.length} tiket untuk "${dauroh.Title}" berhasil!`,
        type: 'success'
      });
    },
  }
});