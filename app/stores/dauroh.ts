// app/stores/dauroh.ts
import { defineStore } from 'pinia';
import { useToastStore } from './toast';
import { useNuxtApp } from '#app';

// Interface DaurohDayDetail
export interface DaurohDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}

// Interface Dauroh (menggunakan sk)
export interface Dauroh {
  sk: string | null; // Identifier utama dari API
  id?: number | null; // Simpan juga ID jika ada dari GET, mungkin berguna? Opsional.
  Title: string;
  Gender: string;
  Date?: { [key: string]: DaurohDayDetail };
  Place: string;
  Price: number;
  poster?: string;
  kuota?: number;
  description?: string;
  pemateri?: string;
}

// Interface payload spesifik untuk POST
export interface DaurohPostPayload {
    Title: string;
    Gender: string;
    place: string; // lowercase
    price: string; // lowercase string
    AccessToken: string;
}

// Interface payload spesifik untuk PUT (basic info atau schedule)
export interface DaurohPutPayload {
    sk: string; // Kirim SK di body jika API butuh
    Title: string;
    Gender: string;
    Place: string; // Uppercase
    Price: string; // Uppercase string
    Date?: { [key: string]: DaurohDayDetail };
    AccessToken: string;
}

// Interface payload saat memanggil action update/add basic dari komponen
export interface DaurohBasicData {
    sk?: string | null; // Hanya ada saat update
    Title: string;
    Gender: string;
    Place: string;
    Price: number; // Komponen mengirim number
}

// Interface payload saat memanggil action update schedule dari komponen
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
      savingBasic: false,
      savingSchedule: false,
    },
    tiketDauroh: [] as Dauroh[],
    adminTiketDauroh: [] as Dauroh[],
    currentDaurohDetail: null as Dauroh | null,
  }),

  getters: {
    // Filter tiket publik
    filteredTiketDauroh: (state): Dauroh[] => {
      const sourceData = state.tiketDauroh || [];
      if (!state.searchQuery) return sourceData;
      return sourceData.filter(dauroh =>
        dauroh.Title.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    },
    // Chunk tiket publik
    tiketDaurohChunks: (state): Dauroh[][] => {
      const filteredData = (state.tiketDauroh || []).filter(dauroh =>
        !state.searchQuery || dauroh.Title.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
      const chunkSize = 4;
      const chunks: Dauroh[][] = [];
      for (let i = 0; i < filteredData.length; i += chunkSize) {
        chunks.push(filteredData.slice(i, i + chunkSize));
      }
      return chunks;
    },
    // Filter & Sort tiket admin berdasarkan SK
    filteredAdminTiketDauroh: (state): Dauroh[] => {
      const dataToSort = Array.isArray(state.adminTiketDauroh) ? state.adminTiketDauroh : [];
      // Mengurutkan string SK (misalnya jika SK adalah timestamp atau UUID)
      return [...dataToSort].sort((a, b) => (b.sk ?? '').localeCompare(a.sk ?? ''));
    },
  },

  actions: {
    setSearchQuery(query: string) { this.searchQuery = query },

    // Fetch Public Data (GET /get-view)
    async fetchPublicTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      if (this.tiketDauroh.length > 0 && !this.loading.tiketDauroh) return;
      this.loading.tiketDauroh = true;
      try {
        const response = await $apiBase.get('/get-view?type=event');
        this.tiketDauroh = response.data.map((event: any): Dauroh => ({
          sk: event.sk || null, // Ambil SK
        //   id: Number(event.id) || undefined, // Ambil ID juga jika ada
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
      } catch (error: any) { /* ... error handling ... */ }
      finally { this.loading.tiketDauroh = false; }
    },

    // Fetch Admin Data (GET /get-default)
    async fetchAdminTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      if (this.loading.adminTiketDauroh) return;
      this.loading.adminTiketDauroh = true;
      try {
        const response = await $apiBase.get('/get-default?type=event');
        this.adminTiketDauroh = response.data.map((event: any): Dauroh => ({
          sk: event.sk || null, // Ambil SK
        //   id: Number(event.id) || undefined, // Ambil ID juga jika ada
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
      } catch (error: any) { /* ... error handling ... */ }
      finally { this.loading.adminTiketDauroh = false; }
    },

    // Fetch Detail (GET /get-default?type=event&sk=...)
    async fetchDaurohDetail(sk: string): Promise<Dauroh | null> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const existing = this.adminTiketDauroh.find(d => d.sk === sk);
      if (existing) { /* ... return cache ... */ }

      this.loading.detail = true;
      this.currentDaurohDetail = null;
      let result: Dauroh | null = null;
      try {
        const response = await $apiBase.get(`/get-default?type=event&sk=${sk}`); // Ganti id dengan sk
        const event = (Array.isArray(response.data) && response.data.length > 0) ? response.data[0] : response.data;
        if (event && typeof event === 'object' && !Array.isArray(event)) {
          this.currentDaurohDetail = {
            sk: event.sk || null,
            // id: Number(event.id) || undefined,
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
          result = this.currentDaurohDetail;
          // Update cache
          const index = this.adminTiketDauroh.findIndex(d => d.sk === sk);
          if (index === -1 && this.currentDaurohDetail) { this.adminTiketDauroh.push(this.currentDaurohDetail); }
          else if (this.currentDaurohDetail) { this.adminTiketDauroh[index] = this.currentDaurohDetail; }
        } else { throw new Error('Event tidak ditemukan'); }
      } catch (error: any) { /* ... error handling ... */ }
      finally { this.loading.detail = false; return result; }
    },

    // Upload Photo (PUT /update-default?type=photo-event&sk=...)
    async uploadEventPhoto(eventSk: string, photoBase64: string): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = localStorage.getItem('AccessToken'); // Gunakan AccessToken untuk body
      if (!accessTokenFromBody) { /* ... handle error ... */ return false; }
      if (!photoBase64 || !photoBase64.includes(',')) { /* ... handle error ... */ return false; }

      const base64Data = photoBase64.split(',')[1];
      const payload = { AccessToken: accessTokenFromBody, OldPicture: "", Picture: base64Data };

      this.loading.uploadPhoto = true;
      let success = false;
      try {
        await $apiBase.put(`/update-default?type=photo-event&sk=${eventSk}`, payload); // URL sudah pakai sk
        toastStore.showToast({ message: 'Poster berhasil diperbarui.', type: 'success' });
        success = true;
        // Opsional: fetch ulang detail untuk URL poster baru
        await this.fetchDaurohDetail(eventSk);
      } catch (error: any) { /* ... error handling (cek Invalid Access Token) ... */ success = false; }
      finally { this.loading.uploadPhoto = false; return success; }
    },

    // Add Basic Info (POST /input-default?type=event)
    async addTiketDaurohBasic(daurohData: Omit<DaurohBasicData, 'sk'>): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = localStorage.getItem('AccessToken'); // Gunakan AccessToken untuk body
      if (!accessTokenFromBody) { /* ... handle error ... */ return false; }

      this.loading.savingBasic = true;
      let success = false;
      
      // Payload POST sesuai Postman
const payload: DaurohPostPayload = {
        Title: daurohData.Title,
        Gender: daurohData.Gender || 'Umum', // Default ke Umum jika kosong
        place: daurohData.Place || '', // lowercase
        price: String(daurohData.Price || 0), // lowercase string, default 0 jika null/undefined
        AccessToken: accessTokenFromBody,
      };

      console.log('Store: addTiketDaurohBasic - Payload to send:', payload); // Debug payload

      try {
        console.log('Store: addTiketDaurohBasic - Sending POST request...');
        // Kirim request POST ke API
        await $apiBase.post('/input-default?type=event', payload);
        console.log('Store: addTiketDaurohBasic - API call successful.');

        toastStore.showToast({ message: 'Event baru berhasil ditambahkan.', type: 'success' });
        success = true; // Set success ke true jika API call berhasil

        // Refresh list SETELAH sukses menambah data
        try {
            console.log('Store: addTiketDaurohBasic - Refreshing admin list...');
            await this.fetchAdminTiketDauroh(); // Refresh list admin
            console.log('Store: addTiketDaurohBasic - Admin list refreshed.');
        } catch (refreshError: any) {
            console.error('Store: addTiketDaurohBasic - Failed to refresh admin list after add:', refreshError);
            // Tetap anggap sukses karena data sudah ditambahkan, beri warning saja
            toastStore.showToast({ message: 'Event ditambahkan, tapi gagal refresh daftar.', type: 'info' });
        }

      } catch (error: any) {
        // Tangani error dari API call POST
        console.error('Store: addTiketDaurohBasic - API call POST failed:', error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Gagal menambahkan event baru.';
        console.error('Store: addTiketDaurohBasic - Error message:', errorMessage);
        toastStore.showToast({ message: `Error: ${errorMessage}`, type: 'danger' });
        success = false; // Set success ke false jika API call gagal

      } finally {
        // SELALU set loading state ke false di akhir, APAPUN YANG TERJADI
        console.log('Store: addTiketDaurohBasic - Executing finally block...');
        this.loading.savingBasic = false;
        console.log('Store: addTiketDaurohBasic - loading.savingBasic set to false.');
      }

      return success; // Return status success akhir
    },

    // Update Basic Info (PUT /update-default?type=event&sk=...)
    async updateTiketDaurohBasic(daurohData: DaurohBasicData): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const eventSk = daurohData.sk;
      if (!eventSk) { /* ... handle error SK null ... */ return false; }
      const accessTokenFromBody = localStorage.getItem('AccessToken'); // Gunakan AccessToken untuk body
      if (!accessTokenFromBody) { /* ... handle error token null ... */ return false; }

      this.loading.savingBasic = true;
      const currentEvent = this.adminTiketDauroh.find(d => d.sk === eventSk);
      const existingDate = currentEvent?.Date; // Ambil Date yang ada

      // Payload PUT sesuai Postman
      const payload: DaurohPutPayload = {
        sk: eventSk, // Sertakan SK di body (sesuai contoh kode sebelumnya, konfirmasi ke BE jika perlu)
        Title: daurohData.Title,
        Gender: daurohData.Gender || 'Umum',
        Place: daurohData.Place || '', // Uppercase
        Price: String(daurohData.Price ?? 0), // Uppercase string
        Date: existingDate || {}, // Kirim Date yang ada atau objek kosong
        AccessToken: accessTokenFromBody,
      };

      let success = false;
      try {
        await $apiBase.put(`/update-default?type=event&sk=${eventSk}`, payload); // Pakai SK di URL
        toastStore.showToast({ message: `Info dasar Event SK ${eventSk} berhasil diperbarui.`, type: 'success' });
        await this.fetchAdminTiketDauroh(); // Refresh list
        // Update detail jika sedang dilihat
        if (this.currentDaurohDetail && this.currentDaurohDetail.sk === eventSk) {
          Object.assign(this.currentDaurohDetail, {
            Title: daurohData.Title, Gender: daurohData.Gender, Place: daurohData.Place, Price: daurohData.Price
            // Date tidak diubah di sini
          });
        }
        success = true;
      } catch (error: any) { /* ... error handling (cek Invalid Access Token) ... */ success = false; }
      finally { this.loading.savingBasic = false; return success; }
    },

    // Update Schedule (PUT /update-default?type=event&sk=...)
    async updateDaurohSchedule(eventSk: string, scheduleData: DaurohSchedulePayload): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = localStorage.getItem('AccessToken'); // Gunakan AccessToken untuk body
      if (!accessTokenFromBody) { /* ... handle error token null ... */ return false; }

      this.loading.savingSchedule = true;
      let currentData: Dauroh | null = this.adminTiketDauroh.find(d => d.sk === eventSk) || null;
      if (!currentData) { currentData = await this.fetchDaurohDetail(eventSk); }
      if (!currentData) { /* ... handle error data not found ... */ return false; }

      // Payload PUT sesuai Postman, timpa Date
      const payload: DaurohPutPayload = {
        sk: eventSk, // Sertakan SK di body (konfirmasi ke BE jika perlu)
        Title: currentData.Title,
        Gender: currentData.Gender,
        Place: currentData.Place,
        Price: String(currentData.Price ?? 0),
        Date: scheduleData, // Jadwal baru
        AccessToken: accessTokenFromBody,
      };

      let success = false;
      try {
        await $apiBase.put(`/update-default?type=event&sk=${eventSk}`, payload); // Pakai SK di URL
        toastStore.showToast({ message: `Jadwal Event SK ${eventSk} berhasil diperbarui.`, type: 'success' });
        await this.fetchAdminTiketDauroh(); // Refresh list
        // Update detail jika sedang dilihat
        if (this.currentDaurohDetail && this.currentDaurohDetail.sk === eventSk) {
          this.currentDaurohDetail.Date = scheduleData;
        }
        success = true;
      } catch (error: any) { /* ... error handling (cek Invalid Access Token) ... */ success = false; }
      finally { this.loading.savingSchedule = false; return success; }
    },

    // Delete Event (DELETE /delete-default?type=event&sk=...)
    async deleteTiketDauroh(sk: string) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = localStorage.getItem('AccessToken'); // Gunakan AccessToken untuk body
      if (!accessTokenFromBody) { /* ... handle error token null ... */ return; }

      try {
        // Endpoint DELETE pakai SK di URL, AccessToken di body
        await $apiBase.delete(`/delete-default?type=event&sk=${sk}`, {
          data: { AccessToken: accessTokenFromBody } // Token di body
        });
        toastStore.showToast({ message: `Event SK ${sk} berhasil dihapus.`, type: 'success' });
        // Hapus dari state
        this.adminTiketDauroh = this.adminTiketDauroh.filter(d => d.sk !== sk);
        this.tiketDauroh = this.tiketDauroh.filter(d => d.sk !== sk);
      } catch (error: any) { /* ... error handling (cek Invalid Access Token) ... */ }
    },
  },
});