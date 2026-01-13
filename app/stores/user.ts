import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { useDaurohStore } from '~/stores/dauroh';
import { useToastStore } from './toast';

// --- INTERFACE (Sudah Dilengkapi biar ga Error di Riwayat) ---

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
  id?: string;       
  date: string;      
  created_at?: string; 

  dauroh: any;       
  participants: Participant[]; 
  
  // 🔥 TAMBAHAN 1: Field ini wajib ada biar error 'Property does not exist' hilang
  title?: string;              
  total_participants?: number; 
  
  // Status
  status: 'Upcoming' | 'Selesai' | 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'active'; 
  paymentStatus?: string;

  // Data Pembayaran
  amount?: number;
  va_number?: string;
  receiver_bank_account?: any;
  sender_bank?: string;
  expired_date?: string;

  // 🔥 TAMBAHAN 2: Penyelamat kalau ada field tak terduga
  [key: string]: any; 
}

export const useUserStore = defineStore('user', {
  state: () => ({
    // Penyimpanan LocalStorage
    tickets: useStorage<UserTicket[]>('user_tickets_v2', [], localStorage),
    isLoading: false,
  }),
  
  getters: {
    getAllTickets: (state) => state.tickets,
    
    getUpcomingTickets: (state) => state.tickets.filter(t => t.status === 'Upcoming' || t.status === 'PAID'),
    getPendingTickets: (state) => state.tickets.filter(t => t.status === 'PENDING'),
  },

  actions: {
    async fetchTickets() {
        return this.tickets;
    },

    registerDauroh(payload: any) {
      const { dauroh, participants, transactionDetails } = payload;
      const toastStore = useToastStore();
      const daurohStore = useDaurohStore();

      let initialStatus: any = 'Upcoming'; 
      let trxAmount = 0;

      if (transactionDetails) {
          initialStatus = transactionDetails.status === 'PENDING' ? 'PENDING' : 'Upcoming';
          trxAmount = Number(transactionDetails.amount || 0);
      }

      const newTicket: UserTicket = {
        SK: transactionDetails?.link_id ? `TRX-${transactionDetails.link_id}` : `TRX-${Date.now()}`,
        id: transactionDetails?.link_id ? `TRX-${transactionDetails.link_id}` : `TRX-${Date.now()}`,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        
        // Simpan Title event di root object juga buat jaga-jaga
        title: dauroh?.Title || 'Event Dauroh',
        
        dauroh: dauroh,
        participants: participants || [],
        total_participants: participants?.length || 0, // Simpan jumlah peserta
        
        status: initialStatus,
        amount: trxAmount || (dauroh.Price * (participants?.length || 1)),

        va_number: transactionDetails?.vaNumber || transactionDetails?.receiver_bank_account?.account_number,
        receiver_bank_account: transactionDetails?.receiver_bank_account,
        sender_bank: transactionDetails?.sender_bank || transactionDetails?.paymentMethod,
        expired_date: transactionDetails?.expiryTime || transactionDetails?.expired_date
      };

      // Cek duplikasi
      const exists = this.tickets.find(t => t.SK === newTicket.SK);
      if (!exists) {
          this.tickets.unshift(newTicket);
      } else {
          Object.assign(exists, newTicket);
      }

      // Update kuota visual
      if (dauroh?.SK && initialStatus !== 'PENDING') {
        const total = participants.length;
        const ikhwan = participants.filter((p:any) => p.Gender?.toLowerCase() === 'ikhwan').length;
        const akhwat = participants.filter((p:any) => p.Gender?.toLowerCase() === 'akhwat').length;
        daurohStore.decrementQuota(dauroh.SK, total, ikhwan, akhwat);
      }

      console.log("Tiket disimpan:", newTicket);
    },

    removeTicket(skOrId: string) {
        if (!skOrId) return;
        this.tickets = this.tickets.filter(t => t.SK !== skOrId && t.id !== skOrId);
        
        const toastStore = useToastStore();
        toastStore.showToast({ message: 'Riwayat berhasil dihapus.', type: 'success' });
    }
  }
});