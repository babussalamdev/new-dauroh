import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import { useToastStore } from "./toast";
import { useNuxtApp, useCookie } from "#app";
import type { 
  ApiDaurohRaw, 
  Dauroh, 
  DaurohBasicData, 
  DaurohSchedulePayload 
} from "~/types/dauroh";

// --- Helpers ---
const parseQuota = (val: any): number | 'non-quota' => {
  if (val === 'non-quota' || val === 'non quota') return 'non-quota';
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const parseSold = (val: any): number => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const serializeQuota = (val: number | string | 'non-quota'): string => {
  return val === 'non-quota' ? 'non-quota' : String(val);
};

const capitalizeText = (text: string): string => {
  if (!text) return "";
  return text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
  Sold_Total: parseSold(event.Sold_Ikhwan_Akhwat),
  Sold_Ikhwan: parseSold(event.Sold_Ikhwan),
  Sold_Akhwat: parseSold(event.Sold_Akhwat),
  Picture: event.Picture || undefined,
  Status: event.Status || 'inactive',
  Description: event.Description || "",
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
    Description: data.Description || "",
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
export const useDaurohStore = defineStore("dauroh", () => {
  // State
  const searchQuery = ref("");
  const tiketDauroh = ref<Dauroh[]>([]);
  const adminTiketDauroh = ref<Dauroh[]>([]);
  const userLogs = ref<any[]>([]);
  const currentDaurohDetail = ref<Dauroh | null>(null);
  const currentPublicDaurohDetail = ref<Dauroh | null>(null);
  
  const loading = reactive({
    tiketDauroh: false,
    adminTiketDauroh: false,
    uploadPhoto: false,
    detail: false,
    savingBasic: false,
    savingSchedule: false,
    detailPublic: false,
  });

  // Getters
  const filteredTiketDauroh = computed(() => {
    if (!searchQuery.value) return tiketDauroh.value || [];
    return tiketDauroh.value.filter((d) => 
      d.Title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  const tiketDaurohChunks = computed(() => {
    const filtered = filteredTiketDauroh.value;
    const chunks: Dauroh[][] = [];
    for (let i = 0; i < filtered.length; i += 4) {
      chunks.push(filtered.slice(i, i + 4));
    }
    return chunks;
  });

  const filteredAdminTiketDauroh = computed(() => {
    const data = Array.isArray(adminTiketDauroh.value) ? adminTiketDauroh.value : [];
    return [...data].sort((a, b) => (b.SK ?? "").localeCompare(a.SK ?? ""));
  });

  // Actions
  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  async function fetchPublicTiketDauroh() {
    if (loading.tiketDauroh) return;
    loading.tiketDauroh = true;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get("/get-view?type=homepage");
      const rawData = Array.isArray(res.data?.event) ? res.data.event : [];
      userLogs.value = [];
      tiketDauroh.value = rawData
        .filter((event: ApiDaurohRaw) => event.Status !== 'inactive')
        .map((event: ApiDaurohRaw) => mapApiToDauroh(event));
    } catch (error) {
      console.error(error);
    } finally {
      loading.tiketDauroh = false;
    }
  }

  async function fetchAuthTiketDauroh() {
    if (loading.tiketDauroh) return;
    loading.tiketDauroh = true;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get("/get-default?type=homepage");
      const rawEvents = Array.isArray(res.data?.event) ? res.data.event : [];
      const rawLogs = Array.isArray(res.data?.logs) ? res.data.logs : [];

      tiketDauroh.value = rawEvents
        .filter((event: ApiDaurohRaw) => event.Status !== 'inactive')
        .map((event: ApiDaurohRaw) => mapApiToDauroh(event));
      userLogs.value = rawLogs;
    } catch (error) {
      console.error(error);
    } finally {
      loading.tiketDauroh = false;
    }
  }

  async function fetchAdminTiketDauroh() {
    if (loading.adminTiketDauroh) return;
    loading.adminTiketDauroh = true;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get("/get-default?type=event");
      const data = res.data?.event || res.data;
      adminTiketDauroh.value = Array.isArray(data) ? data.map(mapApiToDauroh) : [];
    } catch (error) {
      console.error(error);
    } finally {
      loading.adminTiketDauroh = false;
    }
  }

  async function fetchPublicDaurohDetail(SK: string) {
    loading.detailPublic = true;
    currentPublicDaurohDetail.value = null;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get(`/get-view?type=event&sk=${SK}`);
      const data = res.data?.event || res.data;
      const eventRaw = Array.isArray(data) ? (data.find(e => String(e.SK) === SK) || data[0]) : data;

      if (eventRaw) {
        if (eventRaw.Status === 'inactive') throw new Error("Event ini sedang tidak aktif.");
        currentPublicDaurohDetail.value = mapApiToDauroh(eventRaw);
      } else {
        throw new Error("Event tidak ditemukan");
      }
    } catch (error: any) {
      useToastStore().showToast({ message: error.message || "Gagal mengambil event", type: "danger" });
    } finally {
      loading.detailPublic = false;
    }
  }

  async function fetchDaurohDetail(SK: string) {
    loading.detail = true;
    currentDaurohDetail.value = null;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get(`/get-default?type=event&sk=${SK}`);
      const data = res.data?.event || res.data;
      const eventRaw = Array.isArray(data) ? (data.find(e => String(e.SK) === SK) || data[0]) : data;
      if (eventRaw) currentDaurohDetail.value = mapApiToDauroh(eventRaw);
    } catch (error) {
      console.error(error);
    } finally {
      loading.detail = false;
    }
  }

  async function addTiketDaurohBasic(daurohData: Omit<DaurohBasicData, "SK">): Promise<boolean> {
    const token = useCookie("AccessToken").value;
    if (!token) return false;
    loading.savingBasic = true;
    const toast = useToastStore();
    try {
      const { $apiBase } = useNuxtApp() as any;
      const payload = createEventPayload(daurohData as DaurohBasicData, token);
      const res = await $apiBase.post("/input-default?type=event", payload);
      const newEventData = res.data?.event || res.data;
      if (newEventData?.SK) {
        adminTiketDauroh.value.unshift(mapApiToDauroh(newEventData));
        toast.showToast({ message: "Event baru berhasil ditambahkan.", type: "success" });
        return true;
      }
      return false;
    } catch (error: any) {
      toast.showToast({ message: `Gagal: ${error.message}`, type: "danger" });
      return false;
    } finally {
      loading.savingBasic = false;
    }
  }

  async function updateTiketDaurohBasic(daurohData: Partial<DaurohBasicData> & { SK: string }): Promise<boolean> {
    const token = useCookie("AccessToken").value;
    if (!token || !daurohData.SK) return false;
    loading.savingBasic = true;
    const toast = useToastStore();
    
    const currentEvent = adminTiketDauroh.value.find(d => d.SK === daurohData.SK) || currentDaurohDetail.value;
    if (!currentEvent) {
      loading.savingBasic = false;
      toast.showToast({ message: "Data event tidak ditemukan.", type: "danger" });
      return false;
    }

    try {
      const { $apiBase } = useNuxtApp() as any;
      const mergedData: DaurohBasicData = {
        ...currentEvent,
        ...daurohData,
        SK: currentEvent.SK as string
      };
      const payload = createEventPayload(mergedData, token, currentEvent.Date || {});
      await $apiBase.put(`/update-default?type=event&sk=${daurohData.SK}`, payload);

      const updateLocal = (target: Dauroh) => {
        Object.assign(target, { ...mergedData, Title: capitalizeText(mergedData.Title) });
      };

      const targetInList = adminTiketDauroh.value.find(d => d.SK === daurohData.SK);
      if (targetInList) updateLocal(targetInList);
      if (currentDaurohDetail.value?.SK === daurohData.SK) updateLocal(currentDaurohDetail.value);

      toast.showToast({ message: "Berhasil diperbarui.", type: "success" });
      return true;
    } catch (error: any) {
      toast.showToast({ message: "Gagal memperbarui.", type: "danger" });
      return false;
    } finally {
      loading.savingBasic = false;
    }
  }

  async function uploadEventPhoto(eventSK: string, photoBase64: string): Promise<boolean> {
    const token = useCookie("AccessToken").value;
    if (!token || !photoBase64) return false;
    loading.uploadPhoto = true;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const payload = { AccessToken: token, OldPicture: "", Picture: photoBase64.split(",")[1] };
      const res = await $apiBase.put(`/update-default?type=photo-event&sk=${eventSK}`, payload);
      const newPic = res.data?.Picture || res.data?.event?.Picture;
      
      if (newPic) {
        const target = adminTiketDauroh.value.find(d => d.SK === eventSK);
        if (target) target.Picture = newPic;
        if (currentDaurohDetail.value?.SK === eventSK) currentDaurohDetail.value.Picture = newPic;
      }
      useToastStore().showToast({ message: "Foto diperbarui.", type: "success" });
      return true;
    } catch {
      return false;
    } finally {
      loading.uploadPhoto = false;
    }
  }

  async function deleteTiketDauroh(SK: string) {
    const token = useCookie("AccessToken").value;
    if (!token) return;
    try {
      const { $apiBase } = useNuxtApp() as any;
      await $apiBase.delete(`/delete-default?pk=event&sk=${SK}`, { data: { AccessToken: token } });
      adminTiketDauroh.value = adminTiketDauroh.value.filter(d => d.SK !== SK);
      tiketDauroh.value = tiketDauroh.value.filter(d => d.SK !== SK);
      useToastStore().showToast({ message: "Event dihapus.", type: "success" });
    } catch (error) {
      console.error(error);
    }
  }

  function decrementQuota(sk: string, total: number, ikhwan: number, akhwat: number) {
    const sub = (val: any, amt: number) => (val === 'non-quota' ? 'non-quota' : Math.max(0, Number(val) - amt));
    
    const apply = (target: Dauroh | null) => {
      if (!target || target.SK !== sk) return;
      target.Quota_Total = sub(target.Quota_Total, total);
      target.Quota_Ikhwan = sub(target.Quota_Ikhwan, ikhwan);
      target.Quota_Akhwat = sub(target.Quota_Akhwat, akhwat);
    };

    apply(tiketDauroh.value.find(e => e.SK === sk) || null);
    apply(currentPublicDaurohDetail.value);
  }

  return {
    searchQuery, loading, tiketDauroh, adminTiketDauroh, userLogs,
    currentDaurohDetail, currentPublicDaurohDetail,
    filteredTiketDauroh, tiketDaurohChunks, filteredAdminTiketDauroh,
    setSearchQuery, fetchPublicTiketDauroh, fetchAuthTiketDauroh,
    fetchAdminTiketDauroh, fetchPublicDaurohDetail, fetchDaurohDetail,
    addTiketDaurohBasic, updateTiketDaurohBasic, uploadEventPhoto,
    deleteTiketDauroh, decrementQuota
  };
});