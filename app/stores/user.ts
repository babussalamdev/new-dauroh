import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import type { Dauroh } from '~/stores/dauroh';
import { useToastStore } from './toast';

// REVISI: Update tipe data peserta
export interface Participant {
  name: string;
  email?: string; // Optional, hanya wajib untuk peserta 1
  gender?: string;
  age?: number;     // Baru: Usia
  domicile?: string; // Baru: Domisili
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
    // REVISI: Logic tetap menerima array participants dalam satu objek registrationData
    registerDauroh(registrationData: { dauroh: Dauroh, participants: Participant[] }) {
      const { dauroh, participants } = registrationData;
      const toastStore = useToastStore();
      
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