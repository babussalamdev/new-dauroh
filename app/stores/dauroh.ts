import { defineStore } from 'pinia'
import { useToastStore } from './toast';
import { useCookie } from '#app'

export interface DaurohDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}

export interface Dauroh {
  id: number | null;
  Title: string;
  Gender: string;
  Date?: { [key: string]: DaurohDayDetail };
  place: string;
  price: number;
  poster?: string;
}

export const useDaurohStore = defineStore('dauroh', {
  state: () => ({
    searchQuery: '',
    loading: {
      tiketDauroh: false,
    },
    tiketDauroh: [] as Dauroh[],
  }),

  getters: {
    // ... getters tidak berubah ...
    filteredTiketDauroh(state): Dauroh[] {
      if (!state.searchQuery) return state.tiketDauroh;
      return state.tiketDauroh.filter(dauroh =>
        dauroh.Title.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    },
    tiketDaurohChunks(): Dauroh[][] {
      const sourceData = this.filteredTiketDauroh;
      const chunkSize = 4;
      const chunks: Dauroh[][] = [];
      for (let i = 0; i < sourceData.length; i += chunkSize) {
        chunks.push(sourceData.slice(i, i + chunkSize));
      }
      return chunks;
    }
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    async fetchTiketDauroh() {
      // ... fungsi ini tidak berubah ...
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      this.loading.tiketDauroh = true;
      try {
        const response = await $apiBase.get('/get-default?type=event');
        this.tiketDauroh = response.data.map((event: any) => ({
          ...event,
          price: Number(event.price) || 0, 
          poster: event.poster || 'https://via.placeholder.com/300x450.png?text=No+Poster',
        }));
      } catch (error: any) {
        console.error('Gagal mengambil data event:', error);
        toastStore.showToast({ message: 'Gagal memuat data event.', type: 'danger' });
      } finally {
        this.loading.tiketDauroh = false;
      }
    },

    // ===== FUNGSI ADD DIPERBAIKI DENGAN TOKEN YANG BENAR =====
    async addTiketDauroh(payload: { daurohData: any }) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const { daurohData } = payload;

      // 1. Ambil AccessToken dari COOKIE
      const accessToken = useCookie('AccessToken').value;
      if (!accessToken) {
        toastStore.showToast({ message: 'Sesi tidak valid. Silakan login ulang.', type: 'danger' });
        return;
      }

      // 2. Susun payload PERSIS seperti di Postman
      const payloadForBackend = {
        Title: daurohData.title,
        Gender: daurohData.gender,
        place: daurohData.place,
        price: String(daurohData.price),
        AccessToken: accessToken // <-- SEKARANG PAKAI TOKEN YANG BENAR
      };

      try {
        await $apiBase.post('/input-default?type=event', payloadForBackend);
        
        toastStore.showToast({ message: 'Event baru berhasil ditambahkan.', type: 'success' });
        await this.fetchTiketDauroh();

      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Gagal menambahkan event.';
        console.error('Gagal menambahkan event baru:', error.response);
        toastStore.showToast({ message: errorMessage, type: 'danger' });
      }
    },

    async updateTiketDauroh(payload: { daurohData: any, file: File | null }) {
      // ...
    },
    async deleteTiketDauroh(id: number) {
      // ...
    }
  }
})