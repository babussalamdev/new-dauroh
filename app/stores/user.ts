import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import type { Dauroh } from '~/stores/dauroh';
import { useDaurohStore } from '~/stores/dauroh';
import { useToastStore } from './toast';

export interface Participant {
  Name: string;
  Email?: string; 
  Gender: string;
  Age?: number | string;
  Domicile?: string;
  qrCode?: string;
}

export interface UserTicket {
  SK: string;
  date: string;
  dauroh: Dauroh;
  participants: Participant[]; 
  status: 'Upcoming' | 'Selesai'; 
  paymentStatus: 'Lunas' | 'Pending';
}

export const useUserStore = defineStore('user', {
  state: () => ({
    upcomingTickets: useStorage<UserTicket[]>('user_upcoming_tickets', [], localStorage),
    historyTickets: useStorage<UserTicket[]>('user_history_tickets', [], localStorage),
    isLoading: false,
  }),
  
  getters: {
    getUpcomingTickets: (state) => state.upcomingTickets,
    getHistoryTickets: (state) => state.historyTickets,
    getAllTickets: (state) => [...state.upcomingTickets, ...state.historyTickets],
  },

  actions: {
    registerDauroh(registrationData: { dauroh: Dauroh, participants: Participant[] }) {
      const { dauroh, participants } = registrationData;
      const toastStore = useToastStore();
      const daurohStore = useDaurohStore();
      
      if (!dauroh || !participants || participants.length === 0) {
        toastStore.showToast({ message: `Pendaftaran gagal: data tidak lengkap.`, type: 'danger' });
        return; 
      }
      const newTicket: UserTicket = {
        SK: `TRX-${Date.now()}`,
        date: new Date().toISOString(),
        dauroh: dauroh,
        participants: participants,
        status: 'Upcoming',
        paymentStatus: 'Lunas'
      };

      this.upcomingTickets.unshift(newTicket);
      const totalPeserta = participants.length;
      const jumlahIkhwan = participants.filter(p => p.Gender === 'Ikhwan').length;
      const jumlahAkhwat = participants.filter(p => p.Gender === 'Akhwat').length;

      if (dauroh.SK) {
        daurohStore.decrementQuota(dauroh.SK, totalPeserta, jumlahIkhwan, jumlahAkhwat);
      }

      toastStore.showToast({
        message: `Pendaftaran berhasil! ${participants.length} peserta terdaftar.`,
        type: 'success'
      });
    },

    moveToHistory(ticketSK: string) {
      const index = this.upcomingTickets.findIndex(t => t.SK === ticketSK);
      if (index !== -1) {
        const ticket = this.upcomingTickets[index];
        if (ticket) {
          ticket.status = 'Selesai';
          this.historyTickets.unshift(ticket);
          this.upcomingTickets.splice(index, 1);
        }
      }
    }
  }
});