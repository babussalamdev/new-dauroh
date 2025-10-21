// app/stores/dauroh.ts
import { defineStore } from 'pinia'
import { useToastStore } from './toast';
import { useCookie } from '#app'

// Interface DaurohDayDetail dan Dauroh tetap sama...
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
  // Tambahkan properti lain yang mungkin ada dari API
  genre?: string; // Misal dari data lama
  topOverlay?: string; // Misal dari data lama
  kuota?: number; // Misal dari data lama
  description?: string; // Misal dari data lama
  pemateri?: string; // Misal dari data lama
  tempat?: string; // Misal dari data lama
  date?: string; // Misal dari data lama (jika hanya 1 hari)
}


export const useDaurohStore = defineStore('dauroh', {
  state: () => ({
    searchQuery: '',
    loading: {
      // Pisahkan state loading jika perlu, atau gunakan satu jika tidak masalah
      tiketDauroh: false,
      adminTiketDauroh: false, // Tambahkan state loading terpisah untuk admin
    },
    tiketDauroh: [] as Dauroh[], // Untuk data publik / landing page
    adminTiketDauroh: [] as Dauroh[], // Untuk data admin
  }),

  getters: {
    // Getter ini sekarang akan mengambil data publik
    filteredTiketDauroh(state): Dauroh[] {
      const sourceData = state.tiketDauroh; // Ambil dari tiketDauroh (publik)
      if (!state.searchQuery) return sourceData;
      return sourceData.filter(dauroh =>
        dauroh.Title.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    },
    // Getter ini tetap menggunakan filteredTiketDauroh (data publik)
    tiketDaurohChunks(): Dauroh[][] {
      const sourceData = this.filteredTiketDauroh;
      const chunkSize = 4;
      const chunks: Dauroh[][] = [];
      for (let i = 0; i < sourceData.length; i += chunkSize) {
        chunks.push(sourceData.slice(i, i + chunkSize));
      }
      return chunks;
    },
     // Getter baru untuk data admin (jika perlu filtering juga)
    filteredAdminTiketDauroh(state): Dauroh[] {
      const sourceData = state.adminTiketDauroh; // Ambil dari adminTiketDauroh
      // Anda bisa tambahkan logika filter jika diperlukan di halaman admin
      return sourceData;
    }
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // Action untuk mengambil data publik (landing page)
    async fetchPublicTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      // Jangan fetch ulang jika sudah ada data dan tidak sedang loading
      if (this.tiketDauroh.length > 0 && !this.loading.tiketDauroh) return;

      this.loading.tiketDauroh = true;
      try {
        // Gunakan endpoint get-view
        const response = await $apiBase.get('/get-view?type=event');
        this.tiketDauroh = response.data.map((event: any) => ({
          ...event,
          price: Number(event.price) || 0,
          poster: event.poster || 'https://via.placeholder.com/300x450.png?text=No+Poster',
          // Pastikan properti lain juga di-map jika ada perbedaan nama
        }));
      } catch (error: any) {
        console.error('Gagal mengambil data event publik:', error);
        toastStore.showToast({ message: 'Gagal memuat data event.', type: 'danger' });
        this.tiketDauroh = []; // Kosongkan jika gagal
      } finally {
        this.loading.tiketDauroh = false;
      }
    },

    // Action untuk mengambil data default/admin (setelah login)
    async fetchAdminTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      this.loading.adminTiketDauroh = true; // Gunakan state loading admin
      try {
        // Gunakan endpoint get-default
        const response = await $apiBase.get('/get-default?type=event');
        this.adminTiketDauroh = response.data.map((event: any) => ({
          ...event,
          price: Number(event.price) || 0,
          poster: event.poster || 'https://via.placeholder.com/300x450.png?text=No+Poster',
        }));
      } catch (error: any) {
        console.error('Gagal mengambil data event admin:', error);
        toastStore.showToast({ message: 'Gagal memuat data event admin.', type: 'danger' });
         this.adminTiketDauroh = []; // Kosongkan jika gagal
      } finally {
        this.loading.adminTiketDauroh = false; // Gunakan state loading admin
      }
    },

    // Fungsi add tetap sama, karena menambah data biasanya butuh otentikasi
    async addTiketDauroh(payload: { daurohData: any }) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const { daurohData } = payload;

      const accessToken = useCookie('AccessToken').value;
      if (!accessToken) {
        toastStore.showToast({ message: 'Sesi tidak valid. Silakan login ulang.', type: 'danger' });
        return;
      }

      const payloadForBackend = {
        Title: daurohData.title,
        Gender: daurohData.gender,
        place: daurohData.place,
        price: String(daurohData.price),
        AccessToken: accessToken
      };

      try {
        await $apiBase.post('/input-default?type=event', payloadForBackend);
        toastStore.showToast({ message: 'Event baru berhasil ditambahkan.', type: 'success' });
        // Fetch ulang data admin setelah menambah
        await this.fetchAdminTiketDauroh();
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Gagal menambahkan event.';
        console.error('Gagal menambahkan event baru:', error.response);
        toastStore.showToast({ message: errorMessage, type: 'danger' });
      }
    },

    // Fungsi update dan delete juga kemungkinan besar butuh otentikasi,
    // jadi tetap operasikan pada data admin dan panggil fetchAdminTiketDauroh setelahnya
    async updateTiketDauroh(payload: { daurohData: any, file: File | null }) {
      // ... (logika update, panggil API update)
      // Setelah berhasil:
      // await this.fetchAdminTiketDauroh();
      console.warn("Fungsi updateTiketDauroh belum diimplementasikan sepenuhnya dengan API");
    },
    async deleteTiketDauroh(id: number) {
       const { $apiBase } = useNuxtApp();
       const toastStore = useToastStore();
       const accessToken = useCookie('AccessToken').value; // Ambil token
        if (!accessToken) {
            toastStore.showToast({ message: 'Sesi tidak valid.', type: 'danger' });
            return;
        }

       try {
           // Sesuaikan endpoint delete jika berbeda, tambahkan token jika perlu
           await $apiBase.delete(`/delete-default?type=event&id=${id}`, {
             // Mungkin perlu mengirim token di header atau body tergantung API
             // Contoh header: headers: { Authorization: `Bearer ${accessToken}` }
             // Contoh body: data: { AccessToken: accessToken }
             // SEMENTARA kita coba tanpa token eksplisit krn interceptor mungkin sudah handle
           });
           toastStore.showToast({ message: `Event dengan ID ${id} berhasil dihapus.`, type: 'success' });
           await this.fetchAdminTiketDauroh(); // Fetch ulang data admin
       } catch (error: any) {
           const errorMessage = error.response?.data?.message || `Gagal menghapus event ID ${id}.`;
           console.error(`Gagal menghapus event ${id}:`, error.response);
           toastStore.showToast({ message: errorMessage, type: 'danger' });
       }
    }
  }
})