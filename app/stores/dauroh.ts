import { defineStore } from 'pinia';

// Interface (Blueprint Data)
export interface Dauroh {
  id: number;
  title: string;
  genre: string;
  poster: string;
  overlayTitle?: string;
  overlaySubtitle?: string;
  topOverlay?: string;
  date?: string;
}
export interface StudioCard {
  id: number;
  title: string;
  text: string;
  link: string;
  image: string;
}

export const useDaurohStore = defineStore('dauroh', {
  state: () => ({
    // State untuk fungsionalitas UI
    searchQuery: '',
    isLoadingDaurohs: false,
    isLoadingTopDaurohs: false,
    isLoadingTiketDauroh: false,
    isLoadingPromos: false,
    isLoadingStudios: false,

    
    nowPlayingDauroh: [] as Dauroh[],
    topDauroh: [] as Dauroh[],
    tiketDauroh: [] as Dauroh[],
    promoDauroh: [] as Dauroh[],
    studioCards: [] as StudioCard[],
  }),

  getters: {
    // Getters
    filteredTiketDauroh(state): Dauroh[] {
      if (!state.searchQuery) {
        return state.tiketDauroh;
      }
      return state.tiketDauroh.filter(dauroh =>
        dauroh.title.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    },
    tiketDaurohChunks(): Dauroh[][] {
      const sourceData = this.filteredTiketDauroh;
      const chunkSize = 4;
      const chunks = [];
      for (let i = 0; i < sourceData.length; i += chunkSize) {
        chunks.push(sourceData.slice(i, i + chunkSize));
      }
      return chunks;
    }
  },

  actions: {
    //  UI dan fetching data
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    
    async fetchDaurohs() {
      this.isLoadingDaurohs = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await $api.get('/daurohs');
      // this.nowPlayingDauroh = response.data;
      this.isLoadingDaurohs = false;
    },
    
    async fetchTiketDauroh() {
      this.isLoadingTiketDauroh = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isLoadingTiketDauroh = false;
    },
  }
});