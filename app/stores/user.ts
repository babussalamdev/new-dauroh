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
  full_sk?: string; 
  date: string;      
  created_at?: string; 

  dauroh: any;       
  participants: Participant[]; 
  title?: string;              
  total_participants?: number; 
  
  // Status
  status: 'Upcoming' | 'Selesai' | 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED' | 'active' | 'CHECKED_IN';
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
    getDashboardData: (state) => state.tickets.filter(t => ['PENDING', 'PAID', 'Upcoming', 'active', 'CHECKED_IN'].includes(t.status)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  },

  actions: {
    async fetchUserProfile() {
        this.isLoading = true;
        try {
            const { user, getUser } = useAuth();
            
            if (!user.value) {
               await getUser(); 
            }

            if (user.value) {
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

    // --- ACTION UTAMA: FETCH RIWAYAT & GABUNG DATA ---
    async fetchUserTransactions() {
      console.log("Action fetchUserTransactions DIMULAI");
      
      const nuxtApp = useNuxtApp() as any;
      const apiBase = nuxtApp.$apiBase; // Sudah Benar ($apiBase)
      
      if (!apiBase) {
        console.error("⛔ STOP: $apiBase tidak ditemukan.");
        return; 
      }
      
      const daurohStore = useDaurohStore() as any;
      const { user } = useAuth(); 

      this.isLoading = true;

      try {
        // --- STEP 1: LOAD MASTER DATA EVENT ---
        // Kita butuh data event buat tau Judul & Harga
        if (!daurohStore.tiketDauroh || daurohStore.tiketDauroh.length === 0) {
            console.log(" memanggil fetchPublicTiketDauroh...");
            
            // ✅ FIX: Memanggil nama fungsi yang BENAR dari dauroh.ts
            if (typeof daurohStore.fetchPublicTiketDauroh === 'function') {
                await daurohStore.fetchPublicTiketDauroh();
            } else {
               console.warn("⚠️ [DEBUG] Fungsi fetchPublicTiketDauroh tidak ditemukan!");
            }
        }

        // --- STEP 2: TEMBAK API RIWAYAT ---
        console.log("Menembak API /get-payment...");
        const response = await apiBase.get('/get-payment?type=client');
        console.log("Response API:", response.data);
        
        // --- STEP 3: MAPPING (GABUNGKAN DATA) ---
        const mappedTickets = response.data.map((item: any) => {
          
          // Pecah ID: "e9820a#03d240" -> EventID: "e9820a"
          const parts = (item.SK || '').split('#');
          const eventId = parts[0]; 
          const ticketId = parts[1] || item.SK; 

          // 🔍 CARI DATA DETAIL DI STORE
          const foundEvent = daurohStore.tiketDauroh?.find((d: any) => d.SK === eventId);

          // LOGIKA PENGISIAN:
          // Jika event sudah lewat (inactive), mungkin gak ketemu di store (karena filter di dauroh.ts).
          const title = foundEvent?.Title || item.Title || 'Event Tidak Dikenal / Sudah Lewat';
          const place = foundEvent?.Place || 'Lokasi Online / Tidak Diketahui';
          const amount = foundEvent?.Price || 0; 

          // Peserta Dummy (Pakai nama user login)
          const participants = [
            { 
              Name: item.PIC || user.value?.name || 'Peserta', 
              Gender: '-' 
            }
          ];

          return {
             SK: ticketId,
             full_sk: item.SK,
             status: item.Status,
             created_at: item.CreatedAt,
             date: item.CreatedAt, // Kompatibilitas
             
             // Data Gabungan
             dauroh: { 
               Title: title,
               Place: place,
               SK: eventId
             },
             
             amount: amount,
             participants: participants,
             total_participants: 1,

             // Payment Dummy
             va_number: '-', 
             expired_date: '-'
          } as UserTicket;
        });

        // Sort: Terbaru di atas
        this.tickets = mappedTickets.sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        console.log("✅ [DEBUG] Selesai! Data Judul & Harga berhasil di-load.");

      } catch (error) {
        console.error("❌ [DEBUG] ERROR FATAL:", error);
      } finally {
        this.isLoading = false;
      }
    },

    registerDauroh(payload: any) {
      const { dauroh, participants, transactionDetails } = payload;
      const daurohStore = useDaurohStore() as any; 

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
        
        if (typeof daurohStore.decrementQuota === 'function') {
           daurohStore.decrementQuota(dauroh.SK, total, ikhwan, akhwat);
        }
      }

      console.log("Tiket disimpan lokal:", newTicket);
    },

    removeTicket(skOrId: string) {
        if (!skOrId) return;
        this.tickets = this.tickets.filter(t => t.SK !== skOrId && t.id !== skOrId);
        const toastStore = useToastStore();
        toastStore.showToast({ message: 'Riwayat berhasil dihapus.', type: 'success' });
    }
  }
});