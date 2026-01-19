import { defineStore } from "pinia";
import { useToastStore } from "./toast";
import { useNuxtApp, useCookie } from "#app";
import dayjs from "dayjs";

// 1. Interface API Raw
export interface ApiDaurohRaw {
  SK: string;
  Title: string;
  Gender: string;
  Date?: { [key: string]: DaurohDayDetail };
  Registration?: DaurohRegistration;
  Place: string;
  Price: number | string;
  Quota_Ikhwan_Akhwat: number | string | null;
  Quota_Ikhwan: number | string | null;
  Quota_Akhwat: number | string | null;
  Picture?: string;
  Status?: string;
  // Field Baru
  Description?: string;
  Speakers?: string;
  Maklumat?: string;
  Sponsors?: string;
}

export interface DaurohDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}

export interface DaurohRegistration {
  start_registration: string;
  end_registration: string;
}

// 2. Interface UI
export interface Dauroh {
  SK: string | null;
  id?: number | null;
  Title: string;
  Gender: string;
  Date?: { [key: string]: DaurohDayDetail };
  Registration?: DaurohRegistration;
  Place: string;
  Price: number;
  Quota_Ikhwan: number | 'non-quota';
  Quota_Akhwat: number | 'non-quota';
  Quota_Total: number | 'non-quota';
  Picture?: string;
  Status: string;
  // Field Baru
  Description?: string;
  Speakers?: string;
  Maklumat?: string;
  Sponsors?: string;
}

// 3. Interface Form
export interface DaurohBasicData {
  SK?: string | null;
  Title: string;
  Gender: string;
  Place: string;
  Price: number;
  Registration?: DaurohRegistration;
  Quota_Ikhwan: number | 'non-quota';
  Quota_Akhwat: number | 'non-quota';
  Quota_Total: number | 'non-quota';
  Status: string;
  // Field Baru (Wajib ada di interface agar tidak error Type)
  Description?: string;
  Speakers?: string;
  Maklumat?: string;
  Sponsors?: string;
}

export interface DaurohSchedulePayload {
  [key: string]: DaurohDayDetail;
}

// --- Helpers ---
const parseQuota = (val: number | string | null | undefined): number | 'non-quota' => {
  if (val === 'non-quota' || val === 'non quota') return 'non-quota';
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const serializeQuota = (val: number | string | 'non-quota'): string => {
  if (val === 'non-quota') return 'non-quota';
  return String(val);
};

const capitalizeText = (text: string): string => {
  if (!text) return "";
  return text.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const mapApiToDauroh = (event: ApiDaurohRaw): Dauroh => ({
  SK: event.SK,
  Title: capitalizeText(event.Title || ""),
  Gender: event.Gender || "",
  Date: event.Date || undefined,
  Registration: event.Registration || undefined,
  Place: event.Place || "",
  Price: Number(event.Price ?? 0),
  Quota_Total: parseQuota(event.Quota_Ikhwan_Akhwat),
  Quota_Ikhwan: parseQuota(event.Quota_Ikhwan),
  Quota_Akhwat: parseQuota(event.Quota_Akhwat),
  Picture: event.Picture || undefined,
  Status: event.Status || 'inactive',
  // Mapping field baru
  Description: event.Description || "",
  Speakers: event.Speakers || "",
  Maklumat: event.Maklumat || "",
  Sponsors: event.Sponsors || "",
});

const createEventPayload = (data: DaurohBasicData, accessToken: string, existingDate: any = {}) => {
  const payload: any = {
    Title: data.Title,
    Gender: (data.Gender || "ikhwan, akhwat").toLowerCase(),
    Place: data.Place || "",
    Price: String(data.Price || 0),
    AccessToken: accessToken,
    Date: existingDate,
    Registration: data.Registration,
    Status: data.Status,
    // Field baru
    Description: data.Description || "",
    Speakers: data.Speakers || "",
    Maklumat: data.Maklumat || "",
    Sponsors: data.Sponsors || "",
  };

  const g = payload.Gender;

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
    async fetchPublicTiketDauroh() {
      if (this.loading.tiketDauroh) return;
      this.loading.tiketDauroh = true;
      try {
        const { $apiBase } = useNuxtApp();
        const res = await $apiBase.get<ApiDaurohRaw[]>("/get-view?type=homepage");
        const rawData = Array.isArray(res.data) ? res.data : [];
        this.tiketDauroh = rawData
          .filter(event => {
             if (event.Status === 'inactive') return false;
             if (event.Date) {
               const dates = Object.values(event.Date);
               if (dates.length > 0) {
                const firstDate = dates[0]?.date ?? ""; 
                const lastEventDateStr = dates.reduce((max, current) => (current.date > max ? current.date : max), firstDate);
                 const eventEndTime = dayjs(`${lastEventDateStr}T23:59:59`);
                 if (dayjs().isAfter(eventEndTime)) return false;
               }
             }
             return true;
          })
          .map(mapApiToDauroh);
        } catch (error) { console.error(error); } 
        finally { this.loading.tiketDauroh = false; }
    },
    async fetchAdminTiketDauroh() {
      if (this.loading.adminTiketDauroh) return;
      this.loading.adminTiketDauroh = true;
      try {
        const { $apiBase } = useNuxtApp();
        const res = await $apiBase.get<ApiDaurohRaw[]>("/get-default?type=event");
        this.adminTiketDauroh = Array.isArray(res.data) ? res.data.map(mapApiToDauroh) : [];
      } catch (error) { console.error(error); } 
      finally { this.loading.adminTiketDauroh = false; }
    },
    async fetchPublicDaurohDetail(SK: string) {
      this.loading.detailPublic = true;
      this.currentPublicDaurohDetail = null;
      try {
        const { $apiBase } = useNuxtApp();
        const res = await $apiBase.get<ApiDaurohRaw[] | ApiDaurohRaw>(`/get-view?type=event&sk=${SK}`);
        let eventRaw: ApiDaurohRaw | undefined;
        if (Array.isArray(res.data)) {
          eventRaw = res.data.find((e) => String(e.SK) === String(SK)) || res.data[0];
        } else {
          eventRaw = res.data;
        }
        if (eventRaw) {
            if (eventRaw.Status === 'inactive') throw new Error("Event ini sedang tidak aktif.");
            this.currentPublicDaurohDetail = mapApiToDauroh(eventRaw);
        } else { throw new Error("Event tidak ditemukan"); }
      } catch (error: any) {
        const toast = useToastStore();
        toast.showToast({ message: error.message || "Gagal mengambil event", type: "danger" });
      } finally { this.loading.detailPublic = false; }
    },
    async fetchDaurohDetail(SK: string) {
      this.loading.detail = true;
      this.currentDaurohDetail = null;
      try {
        const { $apiBase } = useNuxtApp();
        const res = await $apiBase.get<ApiDaurohRaw[] | ApiDaurohRaw>(`/get-default?type=event&sk=${SK}`);
        let eventRaw: ApiDaurohRaw | undefined;
        if (Array.isArray(res.data)) {
          eventRaw = res.data.find((e) => String(e.SK) === String(SK)) || res.data[0];
        } else { eventRaw = res.data; }
        if (eventRaw) this.currentDaurohDetail = mapApiToDauroh(eventRaw);
        else throw new Error("Event tidak ditemukan");
      } catch (error) { console.error(error); } 
      finally { this.loading.detail = false; }
    },

    // --- Actions ---
    async addTiketDaurohBasic(daurohData: Omit<DaurohBasicData, "SK">): Promise<boolean> {
      const token = useCookie("AccessToken").value;
      if (!token) return false;
      this.loading.savingBasic = true;
      const toast = useToastStore();
      try {
        const { $apiBase } = useNuxtApp();
        const payload = createEventPayload(daurohData as DaurohBasicData, token); 
        const res = await $apiBase.post<ApiDaurohRaw>("/input-default?type=event", payload);
        const newEventData = res.data;
        if (newEventData && newEventData.SK) {
          this.adminTiketDauroh.unshift(mapApiToDauroh(newEventData));
          toast.showToast({ message: "Event baru berhasil ditambahkan.", type: "success" });
          return true;
        }
        return false;
      } catch (error: any) {
        const msg = error.response?.data?.message || error.message || "Gagal menambah event.";
        toast.showToast({ message: `Gagal: ${msg}`, type: "danger" });
        return false;
      } finally { this.loading.savingBasic = false; }
    },

    // [FIX UTAMA]: Gunakan Partial<DaurohBasicData> agar tidak error saat kirim data sebagian
    async updateTiketDaurohBasic(daurohData: Partial<DaurohBasicData> & { SK: string }): Promise<boolean> {
      const token = useCookie("AccessToken").value;
      if (!token || !daurohData.SK) return false;
      this.loading.savingBasic = true;
      const toast = useToastStore();

      const currentEvent = this.adminTiketDauroh.find((d) => d.SK === daurohData.SK) || this.currentDaurohDetail;
      if (!currentEvent) {
        this.loading.savingBasic = false;
        toast.showToast({ message: "Data event tidak ditemukan di lokal.", type: "danger" });
        return false;
      }

      try {
        const { $apiBase } = useNuxtApp();
        // Merge data lama dengan data baru
        const mergedData: DaurohBasicData = {
            SK: currentEvent.SK,
            Title: daurohData.Title ?? currentEvent.Title,
            Gender: daurohData.Gender ?? currentEvent.Gender,
            Place: daurohData.Place ?? currentEvent.Place,
            Price: daurohData.Price ?? currentEvent.Price,
            Quota_Total: daurohData.Quota_Total ?? currentEvent.Quota_Total,
            Quota_Ikhwan: daurohData.Quota_Ikhwan ?? currentEvent.Quota_Ikhwan,
            Quota_Akhwat: daurohData.Quota_Akhwat ?? currentEvent.Quota_Akhwat,
            Registration: daurohData.Registration ?? currentEvent.Registration,
            Status: daurohData.Status ?? currentEvent.Status,
            Description: daurohData.Description ?? currentEvent.Description,
            Speakers: daurohData.Speakers ?? currentEvent.Speakers,
            Maklumat: daurohData.Maklumat ?? currentEvent.Maklumat,
            Sponsors: daurohData.Sponsors ?? currentEvent.Sponsors,
        };

        const payload = createEventPayload(mergedData, token, currentEvent.Date || {}); 
        await $apiBase.put(`/update-default?type=event&sk=${daurohData.SK}`, payload);
        
        const updateState = (target: Dauroh) => {
          Object.assign(target, {
            Title: capitalizeText(mergedData.Title),
            Place: mergedData.Place,
            Price: mergedData.Price,
            Gender: mergedData.Gender,
            Quota_Total: mergedData.Quota_Total,
            Quota_Ikhwan: mergedData.Quota_Ikhwan,
            Quota_Akhwat: mergedData.Quota_Akhwat,
            Registration: mergedData.Registration, 
            Status: mergedData.Status,
            Description: mergedData.Description,
            Speakers: mergedData.Speakers,
            Maklumat: mergedData.Maklumat,
            Sponsors: mergedData.Sponsors,
          });
        };

        const targetInList = this.adminTiketDauroh.find((d) => d.SK === daurohData.SK);
        if (targetInList) updateState(targetInList);
        if (this.currentDaurohDetail?.SK === daurohData.SK) updateState(this.currentDaurohDetail);

        const msg = daurohData.Title ? 'Info dasar Event berhasil diperbarui.' : 'Deskripsi berhasil disimpan.';
        toast.showToast({ message: msg, type: "success" });
        return true;
      } catch (error: any) {
        const msg = error.response?.data?.message || error.message || "Gagal memperbarui event.";
        toast.showToast({ message: `Gagal: ${msg}`, type: "danger" });
        return false;
      } finally { this.loading.savingBasic = false; }
    },

    async updateDaurohSchedule(eventSK: string, scheduleData: DaurohSchedulePayload): Promise<boolean> {
      const token = useCookie("AccessToken").value;
      if (!token) return false;
      this.loading.savingSchedule = true;
      const toast = useToastStore();
      const currentData = this.adminTiketDauroh.find(d => d.SK === eventSK) || this.currentDaurohDetail;
      if (!currentData) { this.loading.savingSchedule = false; return false; }
      try {
        const { $apiBase } = useNuxtApp();
        const basicData: DaurohBasicData = { ...currentData, SK: currentData.SK, Registration: currentData.Registration }; // Casting
        const payload = createEventPayload(basicData, token, scheduleData);
        await $apiBase.put(`/update-default?type=event&sk=${eventSK}`, payload);
        const updateSchedule = (target: Dauroh) => { target.Date = scheduleData; };
        const targetAdmin = this.adminTiketDauroh.find(d => d.SK === eventSK);
        if (targetAdmin) updateSchedule(targetAdmin);
        if (this.currentDaurohDetail?.SK === eventSK) updateSchedule(this.currentDaurohDetail);
        toast.showToast({ message: `Jadwal Event berhasil diperbarui.`, type: "success" });
        return true;
      } catch (error: any) {
        const msg = error.response?.data?.message || error.message || "Gagal menyimpan jadwal.";
        toast.showToast({ message: `Gagal: ${msg}`, type: "danger" });
        return false;
      } finally { this.loading.savingSchedule = false; }
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
        const res = await $apiBase.put<{ Picture: string }>(`/update-default?type=photo-event&sk=${eventSK}`, payload);
        const newPic = res.data?.Picture;
        const updatePic = (target: Dauroh) => { if (newPic) target.Picture = newPic; };
        const target = this.adminTiketDauroh.find(d => d.SK === eventSK);
        if (target) updatePic(target);
        if (this.currentDaurohDetail?.SK === eventSK) updatePic(this.currentDaurohDetail);
        toast.showToast({ message: "Foto berhasil diperbarui.", type: "success" });
        return true;
      } catch (error: any) {
        toast.showToast({ message: "Gagal upload foto.", type: "danger" });
        return false;
      } finally { this.loading.uploadPhoto = false; }
    },
    async deleteTiketDauroh(SK: string) {
      const token = useCookie("AccessToken").value;
      if (!token) return;
      try {
        const { $apiBase } = useNuxtApp();
        const toast = useToastStore();
        await $apiBase.delete(`/delete-default?pk=event&sk=${SK}`, { data: { AccessToken: token } });
        this.adminTiketDauroh = this.adminTiketDauroh.filter((d) => d.SK !== SK);
        this.tiketDauroh = this.tiketDauroh.filter((d) => d.SK !== SK);
        toast.showToast({ message: `Event berhasil dihapus.`, type: "success" });
      } catch (error) { console.error(error); }
    },
    decrementQuota(sk: string, totalPeserta: number, jumlahIkhwan: number, jumlahAkhwat: number) {
      const kurangi = (currentVal: number | 'non-quota', amount: number): number | 'non-quota' => {
        if (currentVal === 'non-quota') return 'non-quota';
        const num = Number(currentVal);
        return num >= amount ? num - amount : 0;
      };
      const eventDiList = this.tiketDauroh.find(e => e.SK === sk);
      if (eventDiList) {
        eventDiList.Quota_Total = kurangi(eventDiList.Quota_Total, totalPeserta);
        eventDiList.Quota_Ikhwan = kurangi(eventDiList.Quota_Ikhwan, jumlahIkhwan);
        eventDiList.Quota_Akhwat = kurangi(eventDiList.Quota_Akhwat, jumlahAkhwat);
      }
      if (this.currentPublicDaurohDetail && this.currentPublicDaurohDetail.SK === sk) {
        this.currentPublicDaurohDetail.Quota_Total = kurangi(this.currentPublicDaurohDetail.Quota_Total, totalPeserta);
        this.currentPublicDaurohDetail.Quota_Ikhwan = kurangi(this.currentPublicDaurohDetail.Quota_Ikhwan, jumlahIkhwan);
        this.currentPublicDaurohDetail.Quota_Akhwat = kurangi(this.currentPublicDaurohDetail.Quota_Akhwat, jumlahAkhwat);
      }
    },
  },
});