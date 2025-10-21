// app/stores/dauroh.ts
import { defineStore } from 'pinia'
import { useToastStore } from './toast';
// Pastikan useCookie dan useNuxtApp diimpor
import { useCookie, useNuxtApp } from '#app'

// Interface DaurohDayDetail dan Dauroh (pastikan ID bisa null atau number)
export interface DaurohDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}
export interface Dauroh {
  id: number | null; // ID penting untuk update
  Title: string;
  Gender: string;
  Date?: { [key: string]: DaurohDayDetail };
  place: string;
  price: number;
  poster?: string; // URL poster dari backend
  genre?: string;
  topOverlay?: string;
  kuota?: number;
  description?: string;
  pemateri?: string;
  tempat?: string;
  date?: string;
}

export const useDaurohStore = defineStore('dauroh', {
  state: () => ({
    searchQuery: '',
    loading: {
      tiketDauroh: false,
      adminTiketDauroh: false,
      uploadPhoto: false, // State loading khusus untuk upload foto
    },
    tiketDauroh: [] as Dauroh[],
    adminTiketDauroh: [] as Dauroh[],
  }),

  getters: {
    // ... getters lainnya tetap sama ...
     filteredTiketDauroh(state): Dauroh[] {
      const sourceData = state.tiketDauroh;
      if (!state.searchQuery) return sourceData;
      return sourceData.filter(dauroh =>
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
    },
    filteredAdminTiketDauroh(state): Dauroh[] {
      // Pastikan data diurutkan berdasarkan ID atau tanggal jika perlu
      return [...state.adminTiketDauroh].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); // Contoh urut ID descending
    }
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // Action fetch data publik (tidak berubah)
    async fetchPublicTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      if (this.tiketDauroh.length > 0 && !this.loading.tiketDauroh) return;
      this.loading.tiketDauroh = true;
      try {
        const response = await $apiBase.get('/get-view?type=event');
        this.tiketDauroh = response.data.map((event: any) => ({
          ...event,
          id: Number(event.id) || null,
          price: Number(event.price) || 0,
          poster: event.poster,
        }));
      } catch (error: any) {
        console.error('Gagal fetch data event publik:', error);
        toastStore.showToast({ message: 'Gagal memuat data event.', type: 'danger' });
        this.tiketDauroh = [];
      } finally {
        this.loading.tiketDauroh = false;
      }
    },

    // Action fetch data admin (tidak berubah)
    async fetchAdminTiketDauroh() {
       const { $apiBase } = useNuxtApp();
       const toastStore = useToastStore();
       // Jangan fetch ulang jika sedang loading
       if (this.loading.adminTiketDauroh) return;
       this.loading.adminTiketDauroh = true;
       try {
         const response = await $apiBase.get('/get-default?type=event');
         this.adminTiketDauroh = response.data.map((event: any) => ({
           ...event,
           id: Number(event.id) || null, // Pastikan ID adalah number
           price: Number(event.price) || 0,
           poster: event.poster,
         }));
       } catch (error: any) {
         console.error('Gagal fetch data event admin:', error);
         toastStore.showToast({ message: 'Gagal memuat data event admin.', type: 'danger' });
          this.adminTiketDauroh = [];
       } finally {
         this.loading.adminTiketDauroh = false;
       }
    },

    /**
     * Action terpisah untuk mengunggah foto poster event.
     * @param eventId - ID dari event yang posternya akan diupdate.
     * @param photoBase64 - String Base64 dari gambar (format WebP atau lainnya).
     * @returns boolean - true jika berhasil, false jika gagal.
     */
    async uploadEventPhoto(eventId: number, photoBase64: string): Promise<boolean> {
        const { $apiBase } = useNuxtApp();
        const toastStore = useToastStore();
        // Ambil AccessToken dari localStorage (lebih persisten daripada cookie jika user menutup tab)
        const accessToken = localStorage.getItem('IdToken');

        if (!accessToken) {
            toastStore.showToast({ message: 'Sesi tidak valid untuk unggah foto. Silakan login ulang.', type: 'danger' });
            return false;
        }
        if (!photoBase64 || !photoBase64.includes(',')) {
             toastStore.showToast({ message: 'Data foto tidak valid.', type: 'danger' });
            return false;
        }

        // Ekstrak data base64 murni (setelah koma)
        const base64Data = photoBase64.split(',')[1];

        // Body payload sesuai contoh Postman
        const payload = {
            AccessToken: accessToken,
            OldPicture: "", // Bisa dikosongkan
            Picture: base64Data
        };

        this.loading.uploadPhoto = true; // Set loading upload
        try {
            // Pastikan eventId (nilai `sk` di Postman) dikirim dengan benar
            await $apiBase.post(`/update-default?type=photo-event&sk=${eventId}`, payload);
            // Tidak perlu toast sukses di sini, akan ditangani oleh action add/update
            console.log(`Foto untuk event ID ${eventId} berhasil diunggah.`);
            return true; // Berhasil
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Gagal mengunggah poster event.';
            console.error(`Gagal mengunggah foto untuk event ID ${eventId}:`, error.response || error);
            // Tampilkan toast error spesifik upload
            toastStore.showToast({ message: `Gagal unggah foto: ${errorMessage}`, type: 'danger' });
            return false; // Gagal
        } finally {
            this.loading.uploadPhoto = false; // Set loading selesai
        }
    },
    async addTiketDauroh(payload: { daurohData: Omit<Dauroh, 'id' | 'poster'>, photoBase64: string | null }) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const { daurohData, photoBase64 } = payload;

      const accessToken = localStorage.getItem('IdToken'); // Ambil dari localStorage
      if (!accessToken) {
        toastStore.showToast({ message: 'Sesi tidak valid.', type: 'danger' });
        return;
      }

      // Payload untuk membuat event (data teks saja)
      const eventPayload = {
        Title: daurohData.Title,
        Gender: daurohData.Gender || 'Umum', // Default jika kosong
        place: daurohData.place || '',
        price: String(daurohData.price || 0), // Kirim sebagai string, default 0
        AccessToken: accessToken
      };

      try {
        // 1. Kirim data event utama
        const response = await $apiBase.post('/input-default?type=event', eventPayload);
        toastStore.showToast({ message: 'Event baru berhasil ditambahkan.', type: 'success' });

        // 2. Cek jika ada ID event baru dari respons
        //    Sesuaikan 'response.data.id', 'response.data.eventId', atau 'response.data.sk'
        const newEventId = response.data.id || response.data.eventId || response.data.sk; // Coba beberapa kemungkinan nama field ID

        if (!newEventId || typeof newEventId !== 'number') {
            console.warn("API tambah event tidak mengembalikan ID event yang valid. Upload foto mungkin gagal.");
            // Lanjutkan fetch data meskipun ID tidak ada, event mungkin sudah tersimpan
        }

        // 3. Jika ada foto DAN ID event valid, upload foto
        let photoUploadSuccess = true; // Anggap sukses jika tidak ada foto
        if (photoBase64 && newEventId && typeof newEventId === 'number') {
             photoUploadSuccess = await this.uploadEventPhoto(newEventId, photoBase64);
        }

        // 4. Fetch ulang daftar event admin
        await this.fetchAdminTiketDauroh();

        // 5. Beri notifikasi tambahan jika upload foto gagal
        if (photoBase64 && !photoUploadSuccess) {
            toastStore.showToast({ message: 'Data event disimpan, tetapi gagal mengunggah poster.', type: 'danger' });
        }

      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Gagal menambahkan event.';
        console.error('Error saat menambah event:', error.response || error);
        toastStore.showToast({ message: errorMessage, type: 'danger' });
      }
    },

    
     // Action untuk mengupdate event yang ada, termasuk upload foto jika ada.
    async updateTiketDauroh(payload: { daurohData: Partial<Dauroh> & { id: number }, photoBase64: string | null }) {
        const { $apiBase } = useNuxtApp();
        const toastStore = useToastStore();
        const { daurohData, photoBase64 } = payload;
        const eventId = daurohData.id;

        if (!eventId) {
            toastStore.showToast({ message: 'ID Event tidak valid untuk update.', type: 'danger' });
            return;
        }

        const accessToken = localStorage.getItem('IdToken'); // Ambil dari localStorage
        if (!accessToken) {
            toastStore.showToast({ message: 'Sesi tidak valid.', type: 'danger' });
            return;
        }

        // Payload untuk update data event (data teks saja)
        const eventPayload = {
            id: eventId, // ID wajib ada untuk update
            Title: daurohData.Title,
            Gender: daurohData.Gender || 'Umum',
            place: daurohData.place || '',
            price: String(daurohData.price ?? 0), // Kirim string, default 0 jika null/undefined
            AccessToken: accessToken
        };

        try {
            // 1. Update data event utama (asumsi endpoint PUT /update-default?type=event)
             await $apiBase.put(`/update-default?type=event`, eventPayload);
             toastStore.showToast({ message: `Event ID ${eventId} berhasil diperbarui.`, type: 'success' });

            // 2. Jika ada foto BARU, upload foto
             let photoUploadSuccess = true;
             if (photoBase64) {
                 photoUploadSuccess = await this.uploadEventPhoto(eventId, photoBase64);
             }

            // 3. Fetch ulang daftar event admin
            await this.fetchAdminTiketDauroh();

             // 4. Beri notifikasi tambahan jika upload foto gagal
             if (photoBase64 && !photoUploadSuccess) {
                 toastStore.showToast({ message: 'Data event diupdate, tetapi gagal mengunggah poster baru.', type: 'danger' });
             }

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || `Gagal mengupdate event ID ${eventId}.`;
            console.error(`Error saat mengupdate event ${eventId}:`, error.response || error);
            toastStore.showToast({ message: errorMessage, type: 'danger' });
        }
    },

    // Action delete (tidak berubah)
    async deleteTiketDauroh(id: number) {
       const { $apiBase } = useNuxtApp();
       const toastStore = useToastStore();
       const accessToken = localStorage.getItem('IdToken'); // Ambil dari localStorage
        if (!accessToken) {
            toastStore.showToast({ message: 'Sesi tidak valid.', type: 'danger' });
            return;
        }

       try {
           // Asumsi API delete memerlukan token di body/data
           await $apiBase.delete(`/delete-default?type=event&id=${id}`, {
             data: { AccessToken: accessToken } // Kirim token di body jika diperlukan
           });
           toastStore.showToast({ message: `Event dengan ID ${id} berhasil dihapus.`, type: 'success' });
           await this.fetchAdminTiketDauroh();
       } catch (error: any) {
           const errorMessage = error.response?.data?.message || `Gagal menghapus event ID ${id}.`;
           console.error(`Gagal menghapus event ${id}:`, error.response || error);
           toastStore.showToast({ message: errorMessage, type: 'danger' });
       }
    }
  }
})