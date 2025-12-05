import { defineStore } from "pinia";
import { useToastStore } from "./toast";
import { useNuxtApp, useCookie } from "#app";

// --- Types ---
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
  Quota_Ikhwan: number | 'non-quota';
  Quota_Akhwat: number | 'non-quota';
  Quota_Total: number | 'non-quota';
  Picture?: string;
}

export interface DaurohBasicData {
  SK?: string | null;
  Title: string;
  Gender: string;
  Place: string;
  Price: number;
  Quota_Ikhwan: number | 'non-quota';
  Quota_Akhwat: number | 'non-quota';
  Quota_Total: number | 'non-quota';
}

export interface DaurohSchedulePayload {
  [key: string]: DaurohDayDetail;
}

// --- Helpers (Utility) ---
const parseQuota = (val: any): number | 'non-quota' => {
  if (val === 'non-quota' || val === 'non quota') return 'non-quota';
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const serializeQuota = (val: any): string => {
  if (val === 'non-quota') return 'non-quota';
  return String(val);
};

const capitalizeText = (text: string): string => {
  if (!text) return "";
  return text.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Mapper: Mengubah respon API mentah menjadi format interface Dauroh
const mapApiToDauroh = (event: any): Dauroh => ({
  SK: event.SK,
  Title: capitalizeText(event.Title || ""),
  Gender: event.Gender || "",
  Date: event.Date || undefined,
  Place: event.Place || "",
  Price: Number(event.Price ?? 0),
  Quota_Total: parseQuota(event.Quota_Ikhwan_Akhwat),
  Quota_Ikhwan: parseQuota(event.Quota_Ikhwan),
  Quota_Akhwat: parseQuota(event.Quota_Akhwat),
  Picture: event.Picture || undefined,
});

// Payload Builder: Menyusun data untuk dikirim ke API (Add/Update)
// [REVISI] Logika diperketat agar hanya mengirim field yang sesuai Gender
const createEventPayload = (data: DaurohBasicData, accessToken: string, existingDate: any = {}) => {
  // Base Payload (Data yang selalu ada)
  const payload: any = {
    Title: data.Title,
    Gender: (data.Gender || "ikhwan, akhwat").toLowerCase(),
    Place: data.Place || "",
    Price: String(data.Price || 0),
    AccessToken: accessToken,
    Date: existingDate, 
  };

  const g = payload.Gender;

  // Logic Seleksi Field Kuota
  if (g === 'ikhwan') {
    payload.Quota_Ikhwan = serializeQuota(data.Quota_Ikhwan);
    
  } else if (g === 'akhwat') {
    payload.Quota_Akhwat = serializeQuota(data.Quota_Akhwat);
    
  } else {
    payload.Quota_Ikhwan_Akhwat = serializeQuota(data.Quota_Total);
    payload.Quota_Ikhwan = serializeQuota(data.Quota_Ikhwan);
    payload.Quota_Akhwat = serializeQuota(data.Quota_Akhwat);
  }

  return payload;
};

// --- Store ---
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
      if (!state.searchQuery) return state.tiketDauroh || [];
      return state.tiketDauroh.filter((d) => d.Title.toLowerCase().includes(state.searchQuery.toLowerCase()));
    },
    tiketDaurohChunks(state): Dauroh[][] {
      const filtered = this.filteredTiketDauroh; 
      const chunks: Dauroh[][] = [];
      for (let i = 0; i < filtered.length; i += 4) {
        chunks.push(filtered.slice(i, i + 4));
      }
      return chunks;
    },
    filteredAdminTiketDauroh: (state): Dauroh[] => {
      const data = Array.isArray(state.adminTiketDauroh) ? state.adminTiketDauroh : [];
      return [...data].sort((a, b) => (b.SK ?? "").localeCompare(a.SK ?? ""));
    },
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    // --- Fetch Actions ---

    async fetchPublicTiketDauroh() {
      if (this.tiketDauroh.length > 0 || this.loading.tiketDauroh) return;
      this.loading.tiketDauroh = true;
      try {
        const { $apiBase } = useNuxtApp();
        const res = await $apiBase.get("/get-view?type=event");
        this.tiketDauroh = Array.isArray(res.data) ? res.data.map(mapApiToDauroh) : [];
      } catch (error) { console.error(error); } 
      finally { this.loading.tiketDauroh = false; }
    },

    async fetchAdminTiketDauroh() {
      if (this.loading.adminTiketDauroh) return;
      this.loading.adminTiketDauroh = true;
      try {
        const { $apiBase } = useNuxtApp();
        const res = await $apiBase.get("/get-default?type=event");
        this.adminTiketDauroh = Array.isArray(res.data) ? res.data.map(mapApiToDauroh) : [];
      } catch (error) { console.error(error); } 
      finally { this.loading.adminTiketDauroh = false; }
    },

    async fetchPublicDaurohDetail(SK: string) {
      this.loading.detailPublic = true;
      this.currentPublicDaurohDetail = null;
      try {
        const { $apiBase } = useNuxtApp();
        const res = await $apiBase.get(`/get-view?type=event&sk=${SK}`);
        
        let eventRaw = res.data;
        if (Array.isArray(eventRaw)) {
          eventRaw = eventRaw.find((e: any) => String(e.SK) === String(SK)) || eventRaw[0];
        }

        if (eventRaw) this.currentPublicDaurohDetail = mapApiToDauroh(eventRaw);
        else throw new Error("Event tidak ditemukan");

      } catch (error: any) {
        const toast = useToastStore();
        toast.showToast({ message: error.message || "Gagal mengambil event", type: "danger" });
      } finally {
        this.loading.detailPublic = false;
      }
    },

    async fetchDaurohDetail(SK: string) {
      this.loading.detail = true;
      this.currentDaurohDetail = null;
      try {
        const { $apiBase } = useNuxtApp();
        const res = await $apiBase.get(`/get-default?type=event&sk=${SK}`);
        
        let eventRaw = res.data;
        if (Array.isArray(eventRaw)) {
          eventRaw = eventRaw.find((e: any) => String(e.SK) === String(SK)) || eventRaw[0];
        }

        if (eventRaw) this.currentDaurohDetail = mapApiToDauroh(eventRaw);
        else throw new Error("Event tidak ditemukan");

      } catch (error) { console.error(error); } 
      finally { this.loading.detail = false; }
    },

    // --- Modification Actions (Admin) ---

    async addTiketDaurohBasic(daurohData: Omit<DaurohBasicData, "SK">): Promise<boolean> {
      const token = useCookie("AccessToken").value;
      if (!token) return false;

      this.loading.savingBasic = true;
      const toast = useToastStore();
      
      try {
        const { $apiBase } = useNuxtApp();
        const payload = createEventPayload(daurohData, token); 
        
        const res = await $apiBase.post("/input-default?type=event", payload);
        const newEventData = res.data;

        if (newEventData && newEventData.SK) {
          const mergedData = { ...daurohData, ...newEventData };
          this.adminTiketDauroh.unshift(mapApiToDauroh(mergedData));
          
          toast.showToast({ message: "Event baru berhasil ditambahkan.", type: "success" });
          return true;
        }
        return false;
      } catch (error: any) {
        toast.showToast({ message: `Gagal: ${error.message}`, type: "danger" });
        return false;
      } finally {
        this.loading.savingBasic = false;
      }
    },

    async updateTiketDaurohBasic(daurohData: DaurohBasicData): Promise<boolean> {
      const token = useCookie("AccessToken").value;
      if (!token || !daurohData.SK) return false;

      this.loading.savingBasic = true;
      const toast = useToastStore();

      const currentEvent = this.adminTiketDauroh.find((d) => d.SK === daurohData.SK);
      
      try {
        const { $apiBase } = useNuxtApp();
        const payload = createEventPayload(daurohData, token, currentEvent?.Date || {}); 

        await $apiBase.put(`/update-default?type=event&sk=${daurohData.SK}`, payload);
        
        if (currentEvent) {
          Object.assign(currentEvent, {
            Title: capitalizeText(daurohData.Title),
            Place: daurohData.Place,
            Price: daurohData.Price,
            Gender: daurohData.Gender,
            Quota_Total: daurohData.Quota_Total,
            Quota_Ikhwan: daurohData.Quota_Ikhwan,
            Quota_Akhwat: daurohData.Quota_Akhwat
          });
        }
        
        if (this.currentDaurohDetail?.SK === daurohData.SK) {
           Object.assign(this.currentDaurohDetail, {
             Title: capitalizeText(daurohData.Title),
             Place: daurohData.Place,
             Price: daurohData.Price,
             Gender: daurohData.Gender,
             Quota_Total: daurohData.Quota_Total,
             Quota_Ikhwan: daurohData.Quota_Ikhwan,
             Quota_Akhwat: daurohData.Quota_Akhwat
           });
        }

        toast.showToast({ message: `Info dasar Event berhasil diperbarui.`, type: "success" });
        return true;
      } catch (error: any) {
        toast.showToast({ message: `Gagal: ${error.message}`, type: "danger" });
        return false;
      } finally {
        this.loading.savingBasic = false;
      }
    },

    async updateDaurohSchedule(eventSK: string, scheduleData: DaurohSchedulePayload): Promise<boolean> {
      const token = useCookie("AccessToken").value;
      if (!token) return false;

      this.loading.savingSchedule = true;
      const toast = useToastStore();

      const currentData = this.adminTiketDauroh.find(d => d.SK === eventSK) || this.currentDaurohDetail;
      if (!currentData) {
         this.loading.savingSchedule = false;
         return false;
      }

      try {
        const { $apiBase } = useNuxtApp();
        const payload = createEventPayload(currentData as DaurohBasicData, token, scheduleData);

        await $apiBase.put(`/update-default?type=event&sk=${eventSK}`, payload);
        
        const target = this.adminTiketDauroh.find(d => d.SK === eventSK);
        if (target) target.Date = scheduleData;
        if (this.currentDaurohDetail?.SK === eventSK) this.currentDaurohDetail.Date = scheduleData;

        toast.showToast({ message: `Jadwal Event berhasil diperbarui.`, type: "success" });
        return true;
      } catch (error: any) {
        const msg = error.response?.data?.message || error.message || "Gagal menyimpan jadwal.";
        toast.showToast({ message: `Gagal: ${msg}`, type: "danger" });
        return false;
      } finally {
        this.loading.savingSchedule = false;
      }
    },

    async uploadEventPhoto(eventSK: string, photoBase64: string): Promise<boolean> {
      const token = useCookie("AccessToken").value;
      if (!token || !photoBase64) return false;

      this.loading.uploadPhoto = true;
      const toast = useToastStore();

      try {
        const { $apiBase } = useNuxtApp();
        const base64Data = photoBase64.split(",")[1];
        const payload = { AccessToken: token, OldPicture: "", Picture: base64Data };

        const res = await $apiBase.put(`/update-default?type=photo-event&sk=${eventSK}`, payload);
        const newPic = res.data?.Picture;

        const target = this.adminTiketDauroh.find(d => d.SK === eventSK);
        if (target && newPic) target.Picture = newPic;
        if (this.currentDaurohDetail?.SK === eventSK && newPic) this.currentDaurohDetail.Picture = newPic;

        toast.showToast({ message: "Foto berhasil diperbarui.", type: "success" });
        return true;
      } catch (error: any) {
        console.error(error);
        toast.showToast({ message: "Gagal upload foto.", type: "danger" });
        return false;
      } finally {
        this.loading.uploadPhoto = false;
      }
    },

    async deleteTiketDauroh(SK: string) {
      const token = useCookie("AccessToken").value;
      if (!token) return;

      try {
        const { $apiBase } = useNuxtApp();
        const toast = useToastStore();
        
        await $apiBase.delete(`/delete-default?pk=event&sk=${SK}`, {
          data: { AccessToken: token },
        });

        this.adminTiketDauroh = this.adminTiketDauroh.filter((d) => d.SK !== SK);
        this.tiketDauroh = this.tiketDauroh.filter((d) => d.SK !== SK);
        
        toast.showToast({ message: `Event berhasil dihapus.`, type: "success" });
      } catch (error) {
        console.error(error);
      }
    },
  },
});