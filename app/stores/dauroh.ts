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
      const toastStore = useToastStore();
      this.loading.tiketDauroh = true
      try {
        // simulasi fetch API
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Jika berhasil, data akan diisi di sini.
        // Contoh: this.tiketDauroh = response.data;
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

    async addTiketDauroh(newDauroh: Dauroh) {
      // contoh BE:
      // const res = await $apiBase.post('/tiket-dauroh', newDauroh)
      // this.tiketDauroh.push(res.data)

      newDauroh.id = Date.now() // id dummy
      this.tiketDauroh.push(newDauroh)
    }
  }
})