// app/stores/dauroh.ts
import { defineStore } from 'pinia';
import { useToastStore } from './toast';
import { useNuxtApp } from '#app';

// Interface DaurohDayDetail (Tidak berubah)
export interface DaurohDayDetail {
  date: string;       // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
}

// Interface Dauroh (Tidak berubah dari revisi sebelumnya)
export interface Dauroh {
  id: number | null;
  Title: string;
  Gender: string;
  Date?: { [key: string]: DaurohDayDetail };
  Place: string;
  Price: number;
  poster?: string;
  // Properti opsional lainnya
  kuota?: number;
  description?: string;
  pemateri?: string;
}

// Tipe payload untuk action basic (dari modal)
export interface DaurohBasicPayloadData {
    id?: number | null; // Opsional untuk add, wajib untuk update
    Title: string;
    Gender: string;
    Place: string;
    Price: number;
}

// Tipe payload untuk action update jadwal (dari halaman detail)
export interface DaurohSchedulePayload {
    [key: string]: DaurohDayDetail;
}


export const useDaurohStore = defineStore('dauroh', {
  state: () => ({
    searchQuery: '',
    loading: {
      tiketDauroh: false,
      adminTiketDauroh: false,
      uploadPhoto: false,
      detail: false,
      savingBasic: false, // Loading state untuk save data basic
      savingSchedule: false, // Loading state untuk save jadwal
    },
    tiketDauroh: [] as Dauroh[],
    adminTiketDauroh: [] as Dauroh[],
    currentDaurohDetail: null as Dauroh | null, // State untuk detail event
  }),

  getters: {
     filteredTiketDauroh(state): Dauroh[] {
        const sourceData = state.tiketDauroh;
        if (!state.searchQuery) return sourceData;
        return sourceData.filter(dauroh =>
            dauroh.Title.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
     },
     tiketDaurohChunks(): Dauroh[][] { // Menggunakan getter filteredTiketDauroh
        const sourceData = this.filteredTiketDauroh; // Akses getter lain via 'this'
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
    setSearchQuery(query: string) { this.searchQuery = query },

    // fetchPublicTiketDauroh
    async fetchPublicTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      if (this.tiketDauroh.length > 0 && !this.loading.tiketDauroh) return;
      this.loading.tiketDauroh = true;
      try {
        const response = await $apiBase.get('/get-view?type=event');
        this.tiketDauroh = response.data.map((event: any): Dauroh => ({
          id: Number(event.id) || null,
          Title: event.Title || '',
          Gender: event.Gender || '',
          Date: event.Date || undefined,
          Place: event.Place || '',
          Price: Number(event.Price) || 0,
          poster: event.poster || undefined,
          kuota: event.kuota ? Number(event.kuota) : undefined,
          description: event.description || undefined,
          pemateri: event.pemateri || undefined,
        }));
      } catch (error: any) {
        console.error('Gagal fetch data event publik:', error);
        toastStore.showToast({ message: 'Gagal memuat data event.', type: 'danger' });
        this.tiketDauroh = [];
      } finally {
        this.loading.tiketDauroh = false;
      }
    },

    // fetchAdminTiketDauroh
    async fetchAdminTiketDauroh() {
       const { $apiBase } = useNuxtApp();
       const toastStore = useToastStore();
       if (this.loading.adminTiketDauroh) return;
       this.loading.adminTiketDauroh = true;
       try {
         const response = await $apiBase.get('/get-default?type=event');
         this.adminTiketDauroh = response.data.map((event: any): Dauroh => ({
           id: Number(event.id) || null,
           Title: event.Title || '',
           Gender: event.Gender || '',
           Date: event.Date || undefined,
           Place: event.Place || '',
           Price: Number(event.Price) || 0,
           poster: event.poster || undefined,
           kuota: event.kuota ? Number(event.kuota) : undefined,
           description: event.description || undefined,
           pemateri: event.pemateri || undefined,
         }));
       } catch (error: any) {
         console.error('Gagal fetch data event admin:', error);
         toastStore.showToast({ message: 'Gagal memuat data event admin.', type: 'danger' });
         this.adminTiketDauroh = [];
       } finally {
         this.loading.adminTiketDauroh = false;
       }
    },

    // ===== fetchDaurohDetail - Perbaikan Return =====
    async fetchDaurohDetail(id: number): Promise<Dauroh | null> {
        const { $apiBase } = useNuxtApp();
        const toastStore = useToastStore();
        const existing = this.adminTiketDauroh.find(d => d.id === id);
        if (existing) {
            this.currentDaurohDetail = { ...existing };
            return this.currentDaurohDetail; // Return dari cache
        }

        this.loading.detail = true;
        this.currentDaurohDetail = null;
        let result: Dauroh | null = null; // Variabel untuk menyimpan hasil
        try {
            const response = await $apiBase.get(`/get-default?type=event&id=${id}`);
            const event = response.data;
            if (event) {
                 this.currentDaurohDetail = {
                   id: Number(event.id) || null,
                   Title: event.Title || '',
                   Gender: event.Gender || '',
                   Date: event.Date || undefined,
                   Place: event.Place || '',
                   Price: Number(event.Price) || 0,
                   poster: event.poster || undefined,
                   kuota: event.kuota ? Number(event.kuota) : undefined,
                   description: event.description || undefined,
                   pemateri: event.pemateri || undefined,
                 };
                 result = this.currentDaurohDetail; // Simpan hasil
            } else {
                 throw new Error('Event tidak ditemukan');
            }
        } catch (error: any) {
            console.error(`Gagal fetch detail event ID ${id}:`, error);
            toastStore.showToast({ message: 'Gagal memuat detail event.', type: 'danger' });
            this.currentDaurohDetail = null;
            result = null; // Set hasil jadi null
        } finally {
            this.loading.detail = false;
            return result; // Return hasil di akhir finally
        }
    },

    // ===== uploadEventPhoto - Perbaikan Return =====
    async uploadEventPhoto(eventId: number, photoBase64: string): Promise<boolean> {
        const { $apiBase } = useNuxtApp();
        const toastStore = useToastStore();
        const accessToken = localStorage.getItem('IdToken');

        if (!accessToken) {
            toastStore.showToast({ message: 'Sesi tidak valid untuk unggah foto.', type: 'danger' });
            return false;
        }
        if (!photoBase64 || !photoBase64.includes(',')) {
             toastStore.showToast({ message: 'Data foto tidak valid.', type: 'danger' });
            return false;
        }

        const base64Data = photoBase64.split(',')[1];
        const payload = {
            AccessToken: accessToken,
            OldPicture: "",
            Picture: base64Data
        };

        this.loading.uploadPhoto = true;
        let success = false; // Variabel hasil
        try {
            // Endpoint Postman: POST /update-default?type=photo-event&sk={eventId}
            // Pastikan parameter 'sk' sesuai
            // await $apiBase.post(`/update-default?type=photo-event&sk=${eventId}`, payload);

            // !! PERHATIAN: Berdasarkan JSON body yang kamu berikan, endpoint upload foto menggunakan PUT !!
            // !! Jika memang PUT, gunakan kode di bawah ini dan pastikan URL & parameter (jika ada) sesuai !!
             await $apiBase.put(`/update-default?type=photo-event&sk=${eventId}`, payload); // Ganti ke PUT jika benar


            console.log(`Foto untuk event ID ${eventId} berhasil diunggah.`);
            success = true; // Berhasil
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Gagal mengunggah poster event.';
            console.error(`Gagal mengunggah foto untuk event ID ${eventId}:`, error.response || error);
            toastStore.showToast({ message: `Gagal unggah foto: ${errorMessage}`, type: 'danger' });
            success = false; // Gagal
        } finally {
            this.loading.uploadPhoto = false;
            return success; // Return hasil di akhir finally
        }
    },

    // ===== addTiketDaurohBasic - Perbaikan Return =====
    async addTiketDaurohBasic(daurohData: Omit<DaurohBasicPayloadData, 'id'>): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessToken = localStorage.getItem('IdToken');
      if (!accessToken) {
        toastStore.showToast({ message: 'Sesi tidak valid.', type: 'danger' });
        return false;
      }

      this.loading.savingBasic = true;
      const payload = {
        Title: daurohData.Title,
        Gender: daurohData.Gender || 'Umum',
        Place: daurohData.Place || '',
        Price: String(daurohData.Price || 0),
      };

      let success = false; // Variabel hasil
      try {
        await $apiBase.post('/input-default?type=event', payload);
        toastStore.showToast({ message: 'Event baru berhasil ditambahkan (info dasar).', type: 'success' });
        await this.fetchAdminTiketDauroh();
        success = true; // Sukses
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Gagal menambahkan info dasar event.';
        console.error('Error saat menambah event basic:', error.response || error);
        toastStore.showToast({ message: errorMessage, type: 'danger' });
        success = false; // Gagal
      } finally {
        this.loading.savingBasic = false;
        return success; // Return hasil di akhir finally
      }
    },

    // ===== updateTiketDaurohBasic - Perbaikan Return =====
    async updateTiketDaurohBasic(daurohData: DaurohBasicPayloadData): Promise<boolean> {
        const { $apiBase } = useNuxtApp();
        const toastStore = useToastStore();
        const eventId = daurohData.id;

        if (!eventId) {
            toastStore.showToast({ message: 'ID Event tidak valid untuk update.', type: 'danger' });
            return false;
        }

        const accessToken = localStorage.getItem('IdToken');
        if (!accessToken) {
            toastStore.showToast({ message: 'Sesi tidak valid.', type: 'danger' });
            return false;
        }

        this.loading.savingBasic = true;
        // Payload disesuaikan dengan JSON body PUT update event
        const payload = {
            id: eventId, // ID biasanya tidak di body PUT tapi di URL/param, tapi ikuti contoh jika perlu
            Title: daurohData.Title,
            Gender: daurohData.Gender || 'Umum',
            Place: daurohData.Place || '', // Nama field di JSON body adalah 'Place'
            Price: String(daurohData.Price ?? 0), // Nama field di JSON body adalah 'Price'
            AccessToken: accessToken,
            // Penting: Sertakan 'Date' yang sudah ada jika API memerlukan semua field saat update
            // Ambil dari state jika perlu
             Date: this.adminTiketDauroh.find(d => d.id === eventId)?.Date || {}
        };

        let success = false; // Variabel hasil
        try {
            // Endpoint: PUT /update-default?type=event
            await $apiBase.put(`/update-default?type=event`, payload); // Body sudah sesuai JSON
            toastStore.showToast({ message: `Info dasar Event ID ${eventId} berhasil diperbarui.`, type: 'success' });
            await this.fetchAdminTiketDauroh();
             if (this.currentDaurohDetail && this.currentDaurohDetail.id === eventId) {
                 this.currentDaurohDetail.Title = daurohData.Title;
                 this.currentDaurohDetail.Gender = daurohData.Gender;
                 this.currentDaurohDetail.Place = daurohData.Place;
                 this.currentDaurohDetail.Price = daurohData.Price;
             }
            success = true; // Sukses
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || `Gagal mengupdate info dasar event ID ${eventId}.`;
            console.error(`Error saat mengupdate event basic ${eventId}:`, error.response || error);
            toastStore.showToast({ message: errorMessage, type: 'danger' });
            success = false; // Gagal
        } finally {
            this.loading.savingBasic = false;
            return success; // Return hasil di akhir finally
        }
    },

    // ===== updateDaurohSchedule - Perbaikan Return & Penanganan Null =====
    async updateDaurohSchedule(eventId: number, scheduleData: DaurohSchedulePayload): Promise<boolean> {
        const { $apiBase } = useNuxtApp();
        const toastStore = useToastStore();
        const accessToken = localStorage.getItem('IdToken');

        if (!accessToken) {
            toastStore.showToast({ message: 'Sesi tidak valid.', type: 'danger' });
            return false;
        }

        this.loading.savingSchedule = true;
        let currentData: Dauroh | null = this.adminTiketDauroh.find(d => d.id === eventId) || null;

        if (!currentData) {
            currentData = await this.fetchDaurohDetail(eventId);
        }

        if (!currentData) {
             toastStore.showToast({ message: `Data event ID ${eventId} tidak ditemukan untuk update jadwal.`, type: 'danger' });
             this.loading.savingSchedule = false;
             return false;
        }

        // Gabungkan data lama dengan jadwal baru (sesuai JSON body PUT update event)
        const payload = {
            id: eventId, // Mungkin tidak perlu di body jika sudah di URL/param API
            Title: currentData.Title,
            Gender: currentData.Gender,
            Place: currentData.Place, // Nama field 'Place'
            Price: String(currentData.Price ?? 0), // Nama field 'Price'
            Date: scheduleData, // Timpa dengan jadwal baru
            AccessToken: accessToken,
            // Jangan sertakan poster
        };

        let success = false;
        try {
            // Endpoint: PUT /update-default?type=event
            await $apiBase.put(`/update-default?type=event`, payload);
            toastStore.showToast({ message: `Jadwal untuk Event ID ${eventId} berhasil diperbarui.`, type: 'success' });
            await this.fetchAdminTiketDauroh();
             if (this.currentDaurohDetail && this.currentDaurohDetail.id === eventId) {
                 this.currentDaurohDetail.Date = scheduleData;
             }
            success = true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || `Gagal mengupdate jadwal event ID ${eventId}.`;
            console.error(`Error saat mengupdate jadwal event ${eventId}:`, error.response || error);
            toastStore.showToast({ message: errorMessage, type: 'danger' });
            success = false;
        } finally {
            this.loading.savingSchedule = false;
            return success;
        }
    },

    async deleteTiketDauroh(id: number) {
       const { $apiBase } = useNuxtApp();
       const toastStore = useToastStore();
       const accessToken = localStorage.getItem('IdToken');
        if (!accessToken) {
            toastStore.showToast({ message: 'Sesi tidak valid.', type: 'danger' });
            return;
        }

       try {
           await $apiBase.delete(`/delete-default?type=event&id=${id}`, {
             data: { AccessToken: accessToken }
           });
           toastStore.showToast({ message: `Event dengan ID ${id} berhasil dihapus.`, type: 'success' });
           this.adminTiketDauroh = this.adminTiketDauroh.filter(d => d.id !== id);
       } catch (error: any) {
           const errorMessage = error.response?.data?.message || `Gagal menghapus event ID ${id}.`;
           console.error(`Gagal menghapus event ${id}:`, error.response || error);
           toastStore.showToast({ message: errorMessage, type: 'danger' });
       }
    }
  }
})