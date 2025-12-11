import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import type { Dauroh } from '~/stores/dauroh';
import { useDaurohStore } from '~/stores/dauroh'; // [1] Import Store
import { useToastStore } from './toast';

export interface Participant {
  name: string;
  email?: string; // Optional, hanya wajib untuk peserta 1
  gender?: string;
  age?: number;
  domicile?: string;
  qrCode?: string;
}

export interface UserTicket {
  SK: string;
  date: string;
  dauroh: Dauroh;
  participants: Participant[]; // Satu objek tiket menampung banyak peserta
  status: 'Upcoming' | 'Selesai'; 
  paymentStatus: 'Lunas' | 'Pending';
}

export const useUserStore = defineStore('user', {
  state: () => ({
    upcomingTickets: useStorage<UserTicket[]>('user_upcoming_tickets', [], sessionStorage),
    historyTickets: useStorage<UserTicket[]>('user_history_tickets', [], sessionStorage),
    isLoading: false,
  }),
  
  getters: {
    getUpcomingTickets: (state) => state.upcomingTickets,
    getHistoryTickets: (state) => state.historyTickets,
    getAllTickets: (state) => [...state.upcomingTickets, ...state.historyTickets],
  },

  actions: {
    // Logic tetap menerima array participants dalam satu objek registrationData
    registerDauroh(registrationData: { dauroh: Dauroh, participants: Participant[] }) {
      const { dauroh, participants } = registrationData;
      const toastStore = useToastStore();
      const daurohStore = useDaurohStore(); // [2] Init Store
      
      if (!dauroh || !participants || participants.length === 0) {
        toastStore.showToast({ message: `Pendaftaran gagal: data tidak lengkap.`, type: 'danger' });
        return; 
      }
      const newTicket: UserTicket = {
        SK: `TRX-${Date.now()}`,
        date: new Date().toISOString(),
        dauroh: dauroh,
        participants: participants, // Array peserta disimpan di dalam satu object
        status: 'Upcoming',
        paymentStatus: 'Lunas'
      };

      this.upcomingTickets.unshift(newTicket);

      // [3] LOGIC BARU: Hitung & Kurangi Kuota
      const totalPeserta = participants.length;
      const jumlahIkhwan = participants.filter(p => p.gender === 'Ikhwan').length;
      const jumlahAkhwat = participants.filter(p => p.gender === 'Akhwat').length;

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