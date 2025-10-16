import { defineStore } from 'pinia'
import { useToastStore } from './toast';

// Interface untuk jadwal per hari (sesuai format backend)
export interface DaurohDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}

// Interface utama yang mencerminkan data dari backend, ditambah properti frontend
// Disesuaikan dengan form baru dan payload API
export interface Dauroh {
  id: number | null;
  Title: string;
  Gender: string; // Sekarang hanya string, bukan array
  // Format Date diubah menjadi objek, bukan array objek
  Date: { [key: string]: DaurohDayDetail };
  place: string;
  price: number; // Menambahkan properti harga
  poster?: string; // Properti opsional khusus untuk frontend
}

export const useDaurohStore = defineStore('dauroh', {
  state: () => ({
    searchQuery: '',
    loading: {
      tiketDauroh: false,
    },
    // Pastikan data dummy atau fetch awal sesuai dengan interface Dauroh yang baru
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

    async fetchTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      this.loading.tiketDauroh = true
      try {
        // const response = await $apiBase.get('/get-events');
        // this.tiketDauroh = response.data.map(event => ({ ...event, poster: 'URL_POSTER_DEFAULT_JIKA_ADA' }));
      } catch (error) {
        toastStore.showToast({ message: 'Gagal memuat data event.', type: 'danger' });
      } finally {
        this.loading.tiketDauroh = false
      }
    },

    async addTiketDauroh(payload: { daurohData: any, file: File | null }) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const { daurohData, file } = payload;
      
      // 1. Transformasi data 'days' dari array menjadi objek sesuai format API
      const datesObject: { [key: string]: DaurohDayDetail } = {};
      daurohData.days.forEach((day: any, index: number) => {
        const dayKey = `day_${index + 1}`;
        datesObject[dayKey] = {
          date: day.date,
          start_time: day.startTime, // konversi camelCase ke snake_case
          end_time: day.endTime      // konversi camelCase ke snake_case
        };
      });

      // 2. Siapkan payload untuk dikirim ke backend
      const payloadForBackend = {
        Title: daurohData.title,
        Gender: daurohData.gender, // Langsung ambil dari dropdown
        Date: datesObject,         // Gunakan objek yang sudah ditransformasi
        place: daurohData.place,
        price: daurohData.price,   // Tambahkan harga
        // AccessToken bisa ditambahkan di sini atau melalui interceptor
      };

      try {
        console.log('Sending to backend:', payloadForBackend);
        // const response = await $apiBase.post('/input-default', payloadForBackend);
        
        // --- Simulasi Frontend ---
        const newDauroh: Dauroh = { 
          ...payloadForBackend, 
          id: Date.now() 
        };
        if (file) {
          newDauroh.poster = URL.createObjectURL(file);
        } else {
          newDauroh.poster = 'https://via.placeholder.com/300x450.png?text=No+Poster';
        }
        this.tiketDauroh.push(newDauroh);
        // --- Akhir Simulasi ---

        toastStore.showToast({ message: 'Event baru berhasil ditambahkan.', type: 'success' });

      } catch (error) {
        toastStore.showToast({ message: 'Gagal menambahkan event baru.', type: 'danger' });
      }
    },

    async updateTiketDauroh(payload: { daurohData: any, file: File | null }) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const { daurohData, file } = payload;
      
      // Logika transformasi dan persiapan payload sama seperti 'add'
      const datesObject: { [key: string]: DaurohDayDetail } = {};
      daurohData.days.forEach((day: any, index: number) => {
        const dayKey = `day_${index + 1}`;
        datesObject[dayKey] = {
          date: day.date,
          start_time: day.startTime,
          end_time: day.endTime
        };
      });

      const payloadForBackend = {
        id: daurohData.id,
        Title: daurohData.title,
        Gender: daurohData.gender,
        Date: datesObject,
        place: daurohData.place,
        price: daurohData.price,
      };

      try {
        // const response = await $apiBase.put(`/update-event/${daurohData.id}`, payloadForBackend);

        // --- Simulasi Frontend ---
        const index = this.tiketDauroh.findIndex(d => d.id === daurohData.id);
        if (index !== -1) {
          // Buat objek baru untuk pembaruan
          const updatedDauroh = { 
            ...this.tiketDauroh[index], // Ambil data lama (seperti poster)
            ...payloadForBackend      // Timpa dengan data baru
          };

          if (file) {
            updatedDauroh.poster = URL.createObjectURL(file);
          }
          
          this.tiketDauroh[index] = updatedDauroh;
        }
        // --- Akhir Simulasi ---
        toastStore.showToast({ message: 'Event berhasil diperbarui.', type: 'success' });
      } catch (error) {
        toastStore.showToast({ message: 'Gagal memperbarui event.', type: 'danger' });
      }
    },

    async deleteTiketDauroh(id: number) {
      // Logika delete tidak berubah
      // ...
    }
  }
})