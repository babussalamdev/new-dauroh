import { defineStore } from 'pinia'
import { useToastStore } from './toast';

// Interface Dauroh
export interface Dauroh {
  id: number | null
  title: string
  genre: string
  poster: string
  kuota?: number
  pemateri?: string
  waktu?: string
  tempat?: string
  fasilitas?: string
  syarat?: string
}

export interface StudioCard {
  id: number
  title: string
  text: string
  link: string
  image: string
}

export const useDaurohStore = defineStore('dauroh', {
  state: () => ({
    searchQuery: '',
    loading: {
      nowPlaying: false,
      topDauroh: false,
      tiketDauroh: false,
      promos: false,
      studios: false,
    },

    nowPlayingDauroh: [] as Dauroh[],
    topDauroh: [] as Dauroh[],
    tiketDauroh: [] as Dauroh[],
    promoDauroh: [] as Dauroh[],
    studioCards: [] as StudioCard[]
  }),

  getters: {
    filteredTiketDauroh(state): Dauroh[] {
      if (!state.searchQuery) {
        return state.tiketDauroh
      }
      return state.tiketDauroh.filter(dauroh =>
        dauroh.title.toLowerCase().includes(state.searchQuery.toLowerCase())
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

    async fetchTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      this.loading.tiketDauroh = true
      try {
        // untuk bagian integrasi be nya
        // const response = await $apiBase.get('/tiket-dauroh');
        // this.tiketDauroh = response.data;
      } catch (error) {
        console.error("Gagal mengambil data tiket dauroh:", error);
        toastStore.showToast({
          message: 'Gagal memuat data dauroh. Coba lagi nanti.',
          type: 'danger'
        });
      } finally {
        this.loading.tiketDauroh = false
      }
    },

    async addTiketDauroh(payload: { daurohData: Dauroh, file: File | null }) {
       const { $apiBase } = useNuxtApp();
       const toastStore = useToastStore();
       const { daurohData, file } = payload;
      try {
        if (file) {
          // Simulasi upload file dan mendapatkan URL
          daurohData.poster = URL.createObjectURL(file);
        } else {
          // Gunakan placeholder jika tidak ada file
          daurohData.poster = 'https://via.placeholder.com/300x450.png?text=No+Image';
        }

        // untuk bagian integrasi be nya
        // const response = await $apiBase.post('/tiket-dauroh', formData);
        // this.tiketDauroh.push(response.data);
        
        daurohData.id = Date.now();
        this.tiketDauroh.push(daurohData);

        toastStore.showToast({
          message: 'Dauroh baru berhasil ditambahkan.',
          type: 'success'
        });

      } catch (error) {
        console.error("Gagal menambahkan tiket dauroh:", error);
        toastStore.showToast({
          message: 'Gagal menambahkan dauroh baru.',
          type: 'danger'
        });
      }
    },

    async updateTiketDauroh(payload: { daurohData: Dauroh, file: File | null }) {
      const toastStore = useToastStore();
      const { daurohData, file } = payload;
      try {
        if (file) {
          daurohData.poster = URL.createObjectURL(file);
        }

        const index = this.tiketDauroh.findIndex(d => d.id === daurohData.id);
        if (index !== -1) {
          this.tiketDauroh[index] = daurohData;
          toastStore.showToast({
            message: 'Dauroh berhasil diperbarui.',
            type: 'success'
          });
        }
      } catch (error) {
        console.error("Gagal memperbarui tiket dauroh:", error);
        toastStore.showToast({
          message: 'Gagal memperbarui dauroh.',
          type: 'danger'
        });
      }
    },

    async deleteTiketDauroh(id: number) {
      const toastStore = useToastStore();
      try {
        const index = this.tiketDauroh.findIndex(d => d.id === id);
        if (index !== -1) {
          this.tiketDauroh.splice(index, 1);
          toastStore.showToast({
            message: 'Dauroh berhasil dihapus.',
            type: 'success'
          });
        }
      } catch (error) {
        console.error("Gagal menghapus tiket dauroh:", error);
        toastStore.showToast({
          message: 'Gagal menghapus dauroh.',
          type: 'danger'
        });
      }
    }
  }
})