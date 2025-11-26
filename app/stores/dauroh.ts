import { defineStore } from "pinia";
import { useToastStore } from "./toast";
import { useNuxtApp } from "#app";

export interface DaurohDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}

export interface Dauroh {
  SK: string | null;
  id?: number | null;
  Title: string;
  Gender: string;
  Date?: { [key: string]: DaurohDayDetail };
  Place: string;
  Price: number;
  Kuota: number;
  Picture?: string;
}

export interface DaurohBasicData {
  SK?: string | null;
  Title: string;
  Gender: string;
  Place: string;
  Price: number;
  Kuota: number; 
}

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
    filteredAdminTiketDauroh: (state): Dauroh[] => {
      const dataToSort = Array.isArray(state.adminTiketDauroh) ? state.adminTiketDauroh : [];
      return [...dataToSort].sort((a, b) => (b.SK ?? "").localeCompare(a.SK ?? ""));
    },
  },
  
  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    // Fetch Public Data
    async fetchPublicTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      if (this.tiketDauroh.length > 0 || this.loading.tiketDauroh) return;
      
      this.loading.tiketDauroh = true;
      try {
        const response = await $apiBase.get("/get-view?type=event");
        this.tiketDauroh = response.data.map((event: any): Dauroh => ({
            SK: event.SK,
            Title: event.Title || "",
            Gender: event.Gender || "",
            Date: event.Date || undefined,
            Place: event.Place || "",
            Price: Number(event.Price ?? 0),
            Kuota: Number(event.Kuota ?? 0), // Mapping Kuota
            Picture: event.Picture || undefined,
        }));
      } catch (error: any) {
      } finally {
        this.loading.tiketDauroh = false;
      }
    },

    // Fetch Detail Public
    async fetchPublicDaurohDetail(sk: string): Promise<Dauroh | null> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      this.loading.detailPublic = true;
      this.currentPublicDaurohDetail = null;
      let result: Dauroh | null = null;
      
      try {
        const response = await $apiBase.get(`/get-view?type=event&sk=${sk}`);
        const event = Array.isArray(response.data) && response.data.length > 0 
          ? response.data[0] 
          : (typeof response.data === 'object' && !Array.isArray(response.data) ? response.data : null);

        if (event) {
          result = {
            SK: event.SK,
            Title: event.Title || "",
            Gender: event.Gender || "",
            Date: event.Date || undefined,
            Place: event.Place || "",
            Price: Number(event.Price ?? 0),
            Kuota: Number(event.Kuota ?? 0),
            Picture: event.Picture || undefined,
          };
          this.currentPublicDaurohDetail = result;
        } else {
          throw new Error("Event tidak ditemukan");
        }
      } catch (error: any) {
        toastStore.showToast({ message: error.message || "Gagal mengambil detail event.", type: "danger" });
        result = null;
      } finally {
        this.loading.detailPublic = false;
        return result;
      }
    },

    // Fetch Admin Data
    async fetchAdminTiketDauroh() {
      const { $apiBase } = useNuxtApp();
      if (this.loading.adminTiketDauroh) return;
      this.loading.adminTiketDauroh = true;
      try {
        const response = await $apiBase.get("/get-default?type=event");
        this.adminTiketDauroh = response.data.map((event: any): Dauroh => ({
            SK: event.SK, 
            Title: event.Title || "",
            Gender: event.Gender || "",
            Date: event.Date || undefined,
            Place: event.Place || "", 
            Price: Number(event.Price ?? 0),
            Kuota: Number(event.Kuota ?? 0),
            Picture: event.Picture || undefined,
        }));
      } catch (error: any) {
      } finally {
        this.loading.adminTiketDauroh = false;
      }
    },

    async fetchDaurohDetail(sk: string): Promise<Dauroh | null> {
      const { $apiBase } = useNuxtApp();
      this.loading.detail = true;
      let result: Dauroh | null = null;
      try {
        const response = await $apiBase.get(`/get-default?type=event&sk${sk}`);
        const event = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : response.data;
        if (event && typeof event === "object" && !Array.isArray(event)) {
          result = {
            SK: event.SK,
            Title: event.Title || "",
            Gender: event.Gender || "",
            Date: event.Date || undefined,
            Place: event.Place || "",
            Price: Number(event.Price ?? 0),
            Kuota: Number(event.Kuota ?? 0),
            Picture: event.Picture || undefined,
          };
          this.currentDaurohDetail = result;
        } else {
          throw new Error("Event tidak ditemukan");
        }
      } catch (error: any) {
      } finally {
        this.loading.detail = false;
        return result;
      }
    },

    // Upload Photo
    async uploadEventPhoto(eventSk: string, photoBase64: string): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody || !photoBase64) return false;

      const base64Data = photoBase64.split(",")[1];
      const payload = { AccessToken: accessTokenFromBody, OldPicture: "", Picture: base64Data };

      this.loading.uploadPhoto = true;
      let success = false;
      try {
        await $apiBase.put(`/update-default?type=photo-event&sk=${eventSk}`, payload);
        toastStore.showToast({ message: "Picture berhasil diperbarui.", type: "success" });
        success = true;
        await this.fetchAdminTiketDauroh();
      } catch (error: any) {
        success = false;
      } finally {
        this.loading.uploadPhoto = false;
        return success;
      }
    },

    // Add Basic Info
    async addTiketDaurohBasic(daurohData: Omit<DaurohBasicData, "SK">): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) return false;

      this.loading.savingBasic = true;
      let success = false;

      const payload = {
        Title: daurohData.Title,
        Gender: daurohData.Gender || "Umum",
        Place: daurohData.Place || "", 
        Price: String(daurohData.Price || 0), 
        Kuota: String(daurohData.Kuota || 0), // Kirim Kuota
        AccessToken: accessTokenFromBody,
      };

      try {
        const response = await $apiBase.post("/input-default?type=event", payload);
        const newEventData = response.data;

        if (newEventData && newEventData.SK) {
          const newEvent: Dauroh = {
            SK: newEventData.SK,
            Title: newEventData.Title || daurohData.Title,
            Gender: newEventData.Gender || daurohData.Gender || "Umum",
            Place: newEventData.Place || daurohData.Place || "",
            Price: Number(newEventData.Price ?? daurohData.Price) || 0,
            Kuota: Number(newEventData.Kuota ?? daurohData.Kuota) || 0,
          };
          this.adminTiketDauroh.unshift(newEvent);
          toastStore.showToast({ message: "Event baru berhasil ditambahkan.", type: "success" });
          success = true;
        } else {
          toastStore.showToast({ message: "Event ditambahkan, me-refresh daftar...", type: "info" });
          success = true;
          await this.fetchAdminTiketDauroh();
        }
      } catch (error: any) {
        toastStore.showToast({ message: `Error: ${error.message}`, type: "danger" });
        success = false;
      } finally {
        this.loading.savingBasic = false;
      }
      return success;
    },

    // Update Basic Info
    async updateTiketDaurohBasic(daurohData: DaurohBasicData): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const eventSk = daurohData.SK; 
      if (!eventSk) return false;
      
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) return false;

      this.loading.savingBasic = true;
      const currentEvent = this.adminTiketDauroh.find((d) => d.SK === eventSk);
      const existingDate = currentEvent?.Date;

      const payload = {
        sk: eventSk,
        Title: daurohData.Title,
        Gender: daurohData.Gender || "Umum",
        Place: daurohData.Place || "", 
        Price: String(daurohData.Price ?? 0),
        Kuota: String(daurohData.Kuota ?? 0),
        Date: existingDate || {},
        AccessToken: accessTokenFromBody,
      };

      let success = false;
      try {
        await $apiBase.put(`/update-default?type=event&sk=${eventSk}`, payload);
        toastStore.showToast({ message: `Info dasar Event SK ${eventSk} berhasil diperbarui.`, type: "success" });
        await this.fetchAdminTiketDauroh();
        if (this.currentDaurohDetail && this.currentDaurohDetail.SK === eventSk) {
          await this.fetchDaurohDetail(eventSk);
        }
        success = true;
      } catch (error: any) {
        success = false;
      } finally {
        this.loading.savingBasic = false;
        return success;
      }
    },

    // Update Schedule
    async updateDaurohSchedule(eventSk: string, scheduleData: DaurohSchedulePayload): Promise<boolean> {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) return false;

      this.loading.savingSchedule = true;
      let currentData: Dauroh | null = this.adminTiketDauroh.find((d) => d.SK === eventSk) || null;
      if (!currentData) {
        currentData = await this.fetchDaurohDetail(eventSk);
      }
      if (!currentData) return false;

      const payload = {
        sk: eventSk,
        Title: currentData.Title,
        Gender: currentData.Gender,
        Place: currentData.Place,
        Price: String(currentData.Price ?? 0),
        Kuota: String(currentData.Kuota ?? 0),
        Date: scheduleData,
        AccessToken: accessTokenFromBody,
      };

      let success = false;
      try {
        await $apiBase.put(`/update-default?type=event&sk=${eventSk}`, payload);
        toastStore.showToast({ message: `Jadwal Event SK ${eventSk} berhasil diperbarui.`, type: "success" });
        await this.fetchAdminTiketDauroh();
        if (this.currentDaurohDetail && this.currentDaurohDetail.SK === eventSk) {
          this.currentDaurohDetail.Date = scheduleData;
        }
        success = true;
      } catch (error: any) {
        success = false;
      } finally {
        this.loading.savingSchedule = false;
        return success;
      }
    },

    // Delete Event
    async deleteTiketDauroh(sk: string) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessTokenFromBody = useCookie("AccessToken").value;
      if (!accessTokenFromBody) return;

      try {
        await $apiBase.delete(`/delete-default?pk=event&sk=${sk}`, {
          data: { AccessToken: accessTokenFromBody },
        });
        toastStore.showToast({ message: `Event SK ${sk} berhasil dihapus.`, type: "success" });
        this.adminTiketDauroh = this.adminTiketDauroh.filter((d) => d.SK !== sk);
        this.tiketDauroh = this.tiketDauroh.filter((d) => d.SK !== sk);
      } catch (error: any) {
      }
    },
  },
});