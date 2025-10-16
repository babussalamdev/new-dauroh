import { defineStore } from 'pinia'
import { useToastStore } from './toast';

// Interface untuk jadwal per hari
export interface DaurohDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}

// Interface utama, sesuaikan propertinya dengan data asli dari API kamu nanti
export interface Dauroh {
  id: number | null;
  Title: string;
  Gender: string;
  Date: { [key: string]: DaurohDayDetail };
  place: string;
  price: number;
  poster?: string; // Properti opsional
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
    filteredTiketDauroh(state): Dauroh[] {
      if (!state.searchQuery) {
        return state.tiketDauroh
      }
      return state.tiketDauroh.filter(dauroh =>
        dauroh.Title.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    },
    tiketDaurohChunks(): Dauroh[][] {
      const sourceData = this.filteredTiketDauroh
      const chunkSize = 4
      const chunks: Dauroh[][] = []
      for (let i = 0; i < sourceData.length; i += chunkSize) {
        chunks.push(sourceData.slice(i, i + chunkSize))
      }
      return chunks
    }
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // ===== FUNGSI UNTUK MENGAMBIL DATA EVENT (GET) =====
    async fetchTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      this.loading.tiketDauroh = true
      try {
        // Panggil API endpoint.
        const response = await $apiBase.get('/get-default?type=event');

        // Ini penting untuk debugging, lihat struktur data asli di console browser
        console.log('Respons dari API Get Event:', response.data);

        // Simpan data dari API ke state 'tiketDauroh'
        // Pastikan properti di sini (event.id, event.Title, dll) cocok dengan respons API
        this.tiketDauroh = response.data.map((event: any) => ({
          id: event.id, // Sesuaikan jika nama properti ID berbeda
          Title: event.Title,
          Gender: event.Gender,
          Date: event.Date,
          place: event.place,
          price: event.price,
          poster: event.poster,
        }));

      } catch (error: any) {
        console.error('Gagal mengambil data event:', error);
        const errorMessage = error.response?.data?.message || 'Gagal memuat data event.';
        toastStore.showToast({ message: errorMessage, type: 'danger' });
      } finally {
        this.loading.tiketDauroh = false
      }
    },

    // (Fungsi add, update, delete belum diintegrasikan, biarkan seperti ini dulu)
    async addTiketDauroh(payload: { daurohData: any, file: File | null }) {
      // ... (logika POST akan di sini nanti)
    },
    async updateTiketDauroh(payload: { daurohData: any, file: File | null }) {
    },
    async deleteTiketDauroh(id: number) {
    }
  }
})