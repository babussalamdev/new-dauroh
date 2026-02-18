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
  status: 'Upcoming' | 'Selesai' | 'PENDING' | 'SUCCESSFUL' | 'EXPIRED' | 'FAILED' | 'active' | 'CHECKED_IN';
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
    transactions: (state) => state.tickets,
    getAllTickets: (state) => state.tickets,
    getUpcomingTickets: (state) => state.tickets.filter((t) => t.status === 'Upcoming' || t.status === 'SUCCESSFUL'),
    getPendingTickets: (state) => state.tickets.filter((t) => t.status === 'PENDING'),
    getDashboardData: (state) => [...state.tickets]
      .filter((t) => ['PENDING', 'SUCCESSFUL', 'Upcoming', 'active', 'CHECKED_IN'].includes(t.status))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  },

  actions: {
    async fetchUserTransactions() {
      const nuxtApp = useNuxtApp() as any;
  const apiBase = nuxtApp.$apiBase;
  if (!apiBase) return;

  const daurohStore = useDaurohStore() as any;
  const { user: authUser } = useAuth();

  this.isLoading = true;

  try {
    if (!daurohStore.tiketDauroh || daurohStore.tiketDauroh.length === 0) {
      await daurohStore.fetchPublicTiketDauroh();
    }

    const response = await apiBase.get('/get-payment?type=client');
    let rawData = response.data;
    if (rawData && rawData.data) rawData = rawData.data;

    if (!Array.isArray(rawData)) {
      this.tickets = [];
      return;
    }

    const mappedTickets = rawData.map((item: any) => {
      const parts = (item.SK || '').split('#');
      const eventId = parts[0];
      const foundEvent = daurohStore.tiketDauroh?.find((d: any) => d.SK === eventId);

      // --- STEP 1: HITUNG PESERTA DULU (Kunci Utama) ---
      let participantsList: Participant[] = [];
      let rawP = item.Participant || item.participant || item.Participants || item.objectPerson || item.ObjectPerson;

      // Jika dibungkus string JSON (ini sering terjadi di backend), bongkar dulu
      if (typeof rawP === 'string' && (rawP.startsWith('[') || rawP.startsWith('{'))) {
          try {
              rawP = JSON.parse(rawP);
          } catch (e) { console.error("Gagal parse data peserta:", e); }
      }

      // Pastikan jadi Array yang bersih
      if (Array.isArray(rawP)) {
        participantsList = rawP.map((p: any) => ({
          Name: p.Name || p.name || 'Peserta',
          Gender: p.Gender || p.gender || '-',
          Age: Number(p.Age || p.age || 0),
          Domicile: p.Domicile || p.domicile || '-'
        }));
      } else if (rawP && typeof rawP === 'object') {
        // Jika objectPerson formatnya { person1: {}, person2: {} }
        Object.values(rawP).forEach((p: any) => {
          if (p && (p.Name || p.name)) {
            participantsList.push({
              Name: p.Name || p.name,
              Gender: p.Gender || '-',
              Age: p.Age || 0,
              Domicile: p.Domicile || '-'
            });
          }
        });
      }

      // Fallback minimal 1 orang kalau beneran kosong
      if (participantsList.length === 0) {
        participantsList = [{
          Name: item.PIC || authUser.value?.name || 'Peserta Utama',
          Gender: '-', Age: 0
        }];
      }

      // --- STEP 2: HITUNG TOTAL BERDASARKAN JUMLAH PESERTA ---
      const totalPeserta = participantsList.length; // Sekarang ini harusnya sudah 3
      const hargaSatuan = Number(foundEvent?.Price || 250000);
      
      // Hitung total: Prioritaskan Amount dari API, kalau 0/salah, pakai hitungan manual
      let totalAmount = Number(item.Amount || item.amount || 0);

      // Jika totalAmount dari API cuma harga satuan (misal 250rb) padahal peserta 3,
      // atau jika totalAmount-nya 0, kita kalikan manual.
      if (totalAmount === 0 || (totalAmount <= hargaSatuan && totalPeserta > 1)) {
          totalAmount = hargaSatuan * totalPeserta;
      }

      return {
        SK: item.SK,
        full_sk: item.SK,
        status: item.Status || 'PENDING',
        created_at: item.CreatedAt,
        date: item.CreatedAt,
        dauroh: {
          Title: foundEvent?.Title || item.Subject || 'Event Dauroh',
          Place: foundEvent?.Place || 'Lokasi Online',
          SK: eventId
        },
        amount: totalAmount, // <--- Hasil perkalian step 1 & harga satuan
        participants: participantsList,
        total_participants: totalPeserta,
        Expired_Date: item.Expired_Date || item.expired_date || '-'
      } as UserTicket;
    });

    this.tickets = mappedTickets.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

  } catch (error) {
    console.error("Fetch Transactions Error:", error);
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