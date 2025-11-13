import { defineStore } from "pinia";
import { useToastStore } from "./toast";
import { useNuxtApp } from "#app";

// Interface DaurohDayDetail
export interface DaurohDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}

// Interface Dauroh (menggunakan sk)
export interface Dauroh {
  sk: string | null;
  id?: number | null;
  Title: string;
  Gender: string;
  Date?: { [key: string]: DaurohDayDetail };
  Place: string;
  Price: number;
  Picture?: string;
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

export const useDaurohStore = defineStore("dauroh", {
  state: () => ({
    searchQuery: "",
    loading: {
      tiketDauroh: false,
      adminTiketDauroh: false,
      uploadPhoto: false,
      detail: false,
      savingBasic: false,
      savingSchedule: false,
      detailPublic: false, 
    },
    tiketDauroh: [] as Dauroh[],
    adminTiketDauroh: [] as Dauroh[],
    currentDaurohDetail: null as Dauroh | null,
    currentPublicDaurohDetail: null as Dauroh | null,
  }),

  getters: {
    filteredTiketDauroh: (state): Dauroh[] => {
      const sourceData = state.tiketDauroh || [];
      if (!state.searchQuery) return sourceData;
      return sourceData.filter((dauroh) => dauroh.Title.toLowerCase().includes(state.searchQuery.toLowerCase()));
    },
    // Chunk tiket publik
    tiketDaurohChunks: (state): Dauroh[][] => {
      const filteredData = (state.tiketDauroh || []).filter(
        (dauroh) => !state.searchQuery || dauroh.Title.toLowerCase().includes(state.searchQuery.toLowerCase())
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
      return [...dataToSort].sort((a, b) => (b.sk ?? "").localeCompare(a.sk ?? ""));
    },
  },
  
  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    // Fetch Public Data (GET /get-view)
    async fetchPublicTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      // Hentikan jika data SUDAH ADA atau SEDANG LOADING
      if (this.tiketDauroh.length > 0 || this.loading.tiketDauroh) {
        return;
      }
      
      this.loading.tiketDauroh = true;
      try {
        const response = await $apiBase.get("/get-view?type=event");
        this.tiketDauroh = response.data.map(
          (event: any): Dauroh => ({
            sk: event.SK || event.sk || null, // Baca event.SK
            Title: event.Title || "",
            Gender: event.Gender || "",
            Date: event.Date || undefined,
            Place: event.Place || event.place || "", // Fallback place
            Price: Number(event.Price || event.price) || 0, // Fallback price
            Picture: event.Picture || undefined,
          })
        );
      } catch (error: any) {
      } finally {
        this.loading.tiketDauroh = false;
      }
    },
    // Aksi baru untuk mengambil detail dauroh publik spesifik
    async fetchPublicDaurohDetail(sk: string): Promise<Dauroh | null> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      this.loading.detailPublic = true;
      this.currentPublicDaurohDetail = null;
      let result: Dauroh | null = null;
      
      try {
        // Panggil endpoint /get-view dengan SK
        const response = await $apiBase.get(`/get-view?type=event&sk=${sk}`);
        const event = Array.isArray(response.data) && response.data.length > 0 
          ? response.data[0] 
          : (typeof response.data === 'object' && !Array.isArray(response.data) ? response.data : null);

        if (event) {
          result = {
            sk: event.SK || event.sk || null,
            Title: event.Title || "",
            Gender: event.Gender || "",
            Date: event.Date || undefined,
            Place: event.Place || event.place || "",
            Price: Number(event.Price || event.price) || 0,
            Picture: event.Picture || undefined,
          };
          this.currentPublicDaurohDetail = result;
        } else {
          throw new Error("Event tidak ditemukan");
        }
      } catch (error: any) {
        console.error("Store: fetchPublicDaurohDetail failed:", error);
        toastStore.showToast({
          message: error.message || "Gagal mengambil detail event.",
          type: "danger",
        });
        result = null;
      } finally {
        this.loading.detailPublic = false;
        return result; // Kembalikan data yang di-fetch
      }
    },

    // Fetch Admin Data (GET /get-default)
    async fetchAdminTiketDauroh() {
      // ... (kode asli tidak berubah)
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      if (this.loading.adminTiketDauroh) return;
      this.loading.adminTiketDauroh = true;
      try {
        const response = await $apiBase.get("/get-default?type=event");
        this.adminTiketDauroh = response.data.map(
          (event: any): Dauroh => ({
            sk: event.SK || event.sk || null, // Baca event.SK
            Title: event.Title || "",
            Gender: event.Gender || "",
            Date: event.Date || undefined,
            Place: event.Place || event.place || "", // Fallback place
            Price: Number(event.Price || event.price) || 0, // Fallback price
            Picture: event.Picture || undefined,
          })
        );
      } catch (error: any) {
        /* ... error handling ... */
      } finally {
        this.loading.adminTiketDauroh = false;
      }
    },

    async fetchDaurohDetail(sk: string): Promise<Dauroh | null> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      // Cek cache
      const existing = this.adminTiketDauroh.find((d) => d.sk === sk);
      this.loading.detail = true;
      let result: Dauroh | null = null;
      try {
        const response = await $apiBase.get(`/get-default?type=event&sk${sk}`);
        const event = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : response.data;
        if (event && typeof event === "object" && !Array.isArray(event)) {
          // Simpan hasil ke 'result', JANGAN mutasi state list
          result = {
            sk: event.SK || event.sk || null, // Baca event.SK
            Title: event.Title || "",
            Gender: event.Gender || "",
            Date: event.Date || undefined,
            Place: event.Place || event.place || "", // Fallback place
            Price: Number(event.Price || event.price) || 0, // Fallback price
            Picture: event.Picture || undefined,
          };

          // Simpan ke state detail
          this.currentDaurohDetail = result;
        } else {
          throw new Error("Event tidak ditemukan");
        }
      } catch (error: any) {
        /* ... error handling ... */
      } finally {
        this.loading.detail = false;
        return result; // Kembalikan data yang di-fetch
      }
    },
    // ... (Sisa actions tidak berubah)
    // Upload Photo (PUT /update-default?type=photo-event&sk=...)
    async uploadEventPhoto(eventSk: string, photoBase64: string): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) {
        /* ... handle error ... */ return false;
      }
      if (!photoBase64 || !photoBase64.includes(",")) {
        /* ... handle error ... */ return false;
      }

      const base64Data = photoBase64.split(",")[1];
      const payload = { AccessToken: accessTokenFromBody, OldPicture: "", Picture: base64Data };

      this.loading.uploadPhoto = true;
      let success = false;
      try {
        await $apiBase.put(`/update-default?type=photo-event&sk=${eventSk}`, payload);
        toastStore.showToast({ message: "Picture berhasil diperbarui.", type: "success" });
        success = true;
        // PERBAIKAN: Refresh list admin, BUKAN detail
        await this.fetchAdminTiketDauroh();
      } catch (error: any) {
        /* ... error handling ... */ success = false;
      } finally {
        this.loading.uploadPhoto = false;
        return success;
      }
    },

    // Add Basic Info (POST /input-default?type=event)
    async addTiketDaurohBasic(daurohData: Omit<DaurohBasicData, "sk">): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) {
        /* ... handle error ... */ return false;
      }

      this.loading.savingBasic = true;
      let success = false;

      const payload: DaurohPostPayload = {
        Title: daurohData.Title,
        Gender: daurohData.Gender || "Umum",
        place: daurohData.Place || "",
        price: String(daurohData.Price || 0),
        AccessToken: accessTokenFromBody,
      };

      try {
        const response = await $apiBase.post("/input-default?type=event", payload);
        const newEventData = response.data;

        if (newEventData && newEventData.SK) {
          const newEvent: Dauroh = {
            sk: newEventData.SK, // Ambil SK dari respons
            Title: newEventData.Title || daurohData.Title,
            Gender: newEventData.Gender || daurohData.Gender || "Umum",
            Place: newEventData.place || daurohData.Place || "", // 'place' dari respons
            Price: Number(newEventData.price || daurohData.Price) || 0, // 'price' dari respons
          };

          this.adminTiketDauroh.unshift(newEvent);

          toastStore.showToast({ message: "Event baru berhasil ditambahkan.", type: "success" });
          success = true;
        } else {
          console.error("API POST '/input-default' tidak mengembalikan 'SK' pada respons.");
          toastStore.showToast({ message: "Event ditambahkan, me-refresh daftar...", type: "info" });
          success = true;
          await this.fetchAdminTiketDauroh();
          console.warn("PERINGATAN: 'GET /get-default?type=event' HARUS menyertakan 'SK' agar daftar berfungsi.");
        }
      } catch (error: any) {
        console.error("Store: addTiketDaurohBasic - API call POST failed:", error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Gagal menambahkan event baru.";
        toastStore.showToast({ message: `Error: ${errorMessage}`, type: "danger" });
        success = false;
      } finally {
        this.loading.savingBasic = false;
      }

      return success;
    },

    // Update Basic Info (PUT /update-default?type=event&sk=...)
    async updateTiketDaurohBasic(daurohData: DaurohBasicData): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const eventSk = daurohData.sk;
      if (!eventSk) {
        /* ... handle error SK null ... */ return false;
      }
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) {
        /* ... handle error token null ... */ return false;
      }

      this.loading.savingBasic = true;
      const currentEvent = this.adminTiketDauroh.find((d) => d.sk === eventSk);
      const existingDate = currentEvent?.Date;

      const payload: DaurohPutPayload = {
        sk: eventSk,
        Title: daurohData.Title,
        Gender: daurohData.Gender || "Umum",
        Place: daurohData.Place || "",
        Price: String(daurohData.Price ?? 0),
        Date: existingDate || {},
        AccessToken: accessTokenFromBody,
      };

      let success = false;
      try {
        await $apiBase.put(`/update-default?type=event&sk=${eventSk}`, payload);
        toastStore.showToast({ message: `Info dasar Event SK ${eventSk} berhasil diperbarui.`, type: "success" });

        // PERBAIKAN: Refresh list admin setelah update
        await this.fetchAdminTiketDauroh();
        if (this.currentDaurohDetail && this.currentDaurohDetail.sk === eventSk) {
          //   fetch ulang detailnya agar konsisten
          await this.fetchDaurohDetail(eventSk);
        }
        success = true;
      } catch (error: any) {
        /* ... error handling ... */ success = false;
      } finally {
        this.loading.savingBasic = false;
        return success;
      }
    },

    // Update Schedule (PUT /update-default?type=event&sk=...)
    async updateDaurohSchedule(eventSk: string, scheduleData: DaurohSchedulePayload): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) {
        /* ... handle error token null ... */ return false;
      }

      this.loading.savingSchedule = true;
      let currentData: Dauroh | null = this.adminTiketDauroh.find((d) => d.sk === eventSk) || null;
      if (!currentData) {
        currentData = await this.fetchDaurohDetail(eventSk);
      }
      if (!currentData) {
        /* ... handle error data not found ... */ return false;
      }

      const payload: DaurohPutPayload = {
        sk: eventSk,
        Title: currentData.Title,
        Gender: currentData.Gender,
        Place: currentData.Place,
        Price: String(currentData.Price ?? 0),
        Date: scheduleData,
        AccessToken: accessTokenFromBody,
      };

      let success = false;
      try {
        await $apiBase.put(`/update-default?type=event&sk=${eventSk}`, payload);
        toastStore.showToast({ message: `Jadwal Event SK ${eventSk} berhasil diperbarui.`, type: "success" });

        // Refresh list admin
        await this.fetchAdminTiketDauroh();

        // (Opsional) Update currentDaurohDetail jika sedang dilihat
        if (this.currentDaurohDetail && this.currentDaurohDetail.sk === eventSk) {
          this.currentDaurohDetail.Date = scheduleData;
        }
        success = true;
      } catch (error: any) {
        /* ... error handling ... */ success = false;
      } finally {
        this.loading.savingSchedule = false;
        return success;
      }
    },

    // Delete Event (DELETE /delete-default?pk=event&sk=...)
    async deleteTiketDauroh(sk: string) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) {
        /* ... handle error token null ... */ return;
      }

      try {
        // Endpoint DELETE pakai pk=event
        await $apiBase.delete(`/delete-default?pk=event&sk=${sk}`, {
          data: { AccessToken: accessTokenFromBody },
        });
        toastStore.showToast({ message: `Event SK ${sk} berhasil dihapus.`, type: "success" });
        // Hapus dari state
        this.adminTiketDauroh = this.adminTiketDauroh.filter((d) => d.sk !== sk);
        this.tiketDauroh = this.tiketDauroh.filter((d) => d.sk !== sk);
      } catch (error: any) {
      }
    },
  },
});