import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { useDaurohStore } from '~/stores/dauroh';
import { useToastStore } from './toast';
import { useAuth } from '~/composables/useAuth'; 

// Interface User Profile
export interface UserProfile {
  fullname: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

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
  [key: string]: any; 
}

export const useUserStore = defineStore('user', {
  state: () => ({
    tickets: useStorage<UserTicket[]>('user_tickets_v2', [], localStorage),
    user: null as UserProfile | null,
    isLoading: false,
  }),
  
  getters: {
    getAllTickets: (state) => state.tickets,
    getUpcomingTickets: (state) => state.tickets.filter(t => t.status === 'Upcoming' || t.status === 'PAID'),
    getPendingTickets: (state) => state.tickets.filter(t => t.status === 'PENDING'),
  },

  actions: {
    async fetchUserProfile() {
        this.isLoading = true;
        try {
            // FIX 1: Gunakan 'getUser' (sesuai nama export di useAuth.ts)
            const { user, getUser } = useAuth();
            
            if (!user.value) {
               // FIX 1: Panggil 'getUser()' bukan 'fetchUser()'
               await getUser(); 
            }

            if (user.value) {
                // FIX 2: Urutan Spread Operator diperbaiki
                // Spread '...user.value' ditaruh di atas agar properti default masuk,
                // baru kemudian kita overwrite/mapping properti khusus seperti 'fullname' & 'phone'.
                // Kita HAPUS baris 'email: ...' karena sudah otomatis terambil dari spread '...user.value'
                
                this.user = {
                    ...user.value, 
                    fullname: user.value.name || '', 
                    phone: user.value.phone_number,
                };
            }
        } catch (error) {
            console.error('Gagal mengambil profil user:', error);
        } finally {
            this.isLoading = false;
        }
    },

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
      const finalId = transactionDetails?.link_id 
        ? String(transactionDetails.link_id) 
        : String(Date.now());

      const newTicket: UserTicket = {
        SK: finalId,
        id: finalId,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        title: dauroh?.Title || 'Event Dauroh',
        dauroh: dauroh,
        participants: participants || [],
        total_participants: participants?.length || 0,
        status: initialStatus,
        amount: trxAmount || (dauroh.Price * (participants?.length || 1)),
        va_number: transactionDetails?.vaNumber || transactionDetails?.receiver_bank_account?.account_number,
        receiver_bank_account: transactionDetails?.receiver_bank_account,
        sender_bank: transactionDetails?.sender_bank || transactionDetails?.paymentMethod,
        expired_date: transactionDetails?.expiryTime || transactionDetails?.expired_date
      };

      const exists = this.tickets.find(t => t.SK === newTicket.SK);
      if (!exists) {
          this.tickets.unshift(newTicket);
      } else {
          Object.assign(exists, newTicket);
      }

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