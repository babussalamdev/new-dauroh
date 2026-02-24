import { defineStore } from "pinia";
import { ref, computed, reactive } from "vue";
import { useToastStore } from "./toast";
import { useNuxtApp, useCookie } from "#app";
import type { 
  ApiEventRaw, 
  Event, 
  EventBasicData, 
  EventSchedulePayload 
} from "~/types/event";

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

const mapApiToEvent = (event: ApiEventRaw): Event => ({
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

const createEventPayload = (data: EventBasicData, accessToken: string, existingDate: any = {}) => {
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
export const useEventStore = defineStore("event", () => {
  // State
  const searchQuery = ref("");
  const tiketEvent = ref<Event[]>([]);
  const adminTiketEvent = ref<Event[]>([]);
  const userLogs = ref<any[]>([]);
  const currentEventDetail = ref<Event | null>(null);
  const currentPublicEventDetail = ref<Event | null>(null);
  
  const loading = reactive({
    tiketEvent: false,
    adminTiketEvent: false,
    uploadPhoto: false,
    detail: false,
    savingBasic: false,
    savingSchedule: false,
    detailPublic: false,
  });

  // Getters
  const filteredTiketEvent = computed(() => {
    if (!searchQuery.value) return tiketEvent.value || [];
    return tiketEvent.value.filter((d) => 
      d.Title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  const tiketEventChunks = computed(() => {
    const filtered = filteredTiketEvent.value;
    const chunks: Event[][] = [];
    for (let i = 0; i < filtered.length; i += 4) {
      chunks.push(filtered.slice(i, i + 4));
    }
    return chunks;
  });

  const filteredAdminTiketEvent = computed(() => {
    const data = Array.isArray(adminTiketEvent.value) ? adminTiketEvent.value : [];
    return [...data].sort((a, b) => (b.SK ?? "").localeCompare(a.SK ?? ""));
  });

const isNonQuota = (eventObj: Event | null | undefined) => {
    if (!eventObj) return false;
    const check = (val: any) => String(val).toLowerCase().trim() === 'non-quota';
    return check(eventObj.Quota_Total) || check(eventObj.Quota_Ikhwan) || check(eventObj.Quota_Akhwat);
  };

  const getGenderLabel = (g: string | undefined) =>{
    if (!g) return "Umum"
    const lower = g.toLowerCase();
    if (lower.includes('ikhwan') && lower.includes('akhwat')) return "Umum";
    if (lower.includes('ikhwan') || lower.includes('laki') || lower.includes('pria')) return "Khusus Ikhwan"; 
    if (lower.includes('akhwat') || lower.includes('perempuan') || lower.includes('wanita')) return 'Khusus Akhwat';
    return 'Umum';
  };
  const showTotal = (eventObj: Event | null | undefined) => {
    if (!eventObj) return false;
    if (isNonQuota(eventObj)) return false;
    const g = eventObj.Gender?.toLowerCase() || '';
    return g === 'umum' || (!g.includes('ikhwan') && !g.includes('akhwat'));
  };
  const showIkhwan = (eventObj: Event | null | undefined) => {
    if (isNonQuota(eventObj)) return false;
    const g = eventObj?.Gender?.toLowerCase() || '';
    return g.includes('ikhwan') || g.includes('laki') || g.includes('pria') || g.includes('ikhwan, akhwat');
  };
  const showAkhwat = (eventObj: Event | null | undefined) => {
    if (isNonQuota(eventObj)) return false;
    const g = eventObj?.Gender?.toLowerCase() || '';
    return g.includes('akhwat') || g.includes('perempuan') || g.includes('wanita') || g.includes('ikhwan, akhwat');
  };
  const getRemaining = (quota: number | string | undefined, sold: number | string | undefined) => {
    if (String(quota).toLowerCase() === 'non-quota') return 'Tanpa Batas';
    const q = Number(quota) || 0;
    const s = Number(sold) || 0;
    const remain = q - s;
    return remain < 0 ? 0 : remain;
  };
  const formatQuota = (val: string | number) => {
    if (String(val).toLowerCase() === 'non-quota' || val === 'Tanpa Batas') return 'Tanpa Batas';
    if (val === 0 || val === '0') return '0 (Penuh)';
    return `${val}`;
  };
  const totalQuotaDisplay = (eventObj: Event | null | undefined) => {
    if (!eventObj) return '-';
    if (isNonQuota(eventObj)) return 'Tanpa Batas';

    let text = [];
    if (showIkhwan(eventObj)) text.push(`Ikhwan: ${eventObj.Quota_Ikhwan}`);
    if (showAkhwat(eventObj)) text.push(`Akhwat: ${eventObj.Quota_Akhwat}`);

    if (text.length > 0) return text.join(', ');

    return `${eventObj.Quota_Total} Kursi`;
  };

  const registrationStatus = (eventObj: Event | null | undefined) => {
    if (!eventObj) return { canRegister: false, message: 'Loading...' };

    if (eventObj.Status !== 'active') return { canRegister: false, message: 'Event Selesai / Tutup' };

    if (isNonQuota(eventObj)) {
       return { canRegister: true, message: 'Daftar Sekarang' };
    }

    const remTotal = getRemaining(eventObj.Quota_Total, eventObj.Sold_Total);
    const remIkhwan = getRemaining(eventObj.Quota_Ikhwan, eventObj.Sold_Ikhwan);
    const remAkhwat = getRemaining(eventObj.Quota_Akhwat, eventObj.Sold_Akhwat);

    if (
       (typeof remTotal === 'number' && remTotal > 0) ||
       (typeof remIkhwan === 'number' && remIkhwan > 0) ||
       (typeof remAkhwat === 'number' && remAkhwat > 0)
    ) {
       return { canRegister: true, message: 'Daftar Sekarang' };
    }

    return { canRegister: false, message: 'Kuota Penuh' };
  };
  // Actions
  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  async function fetchPublicTiketEvent() {
    if (loading.tiketEvent) return;
    loading.tiketEvent = true;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get("/get-view?type=homepage");
      const rawData = Array.isArray(res.data?.event) ? res.data.event : [];
      userLogs.value = [];
      tiketEvent.value = rawData
        .filter((event: ApiEventRaw) => event.Status !== 'inactive')
        .map((event: ApiEventRaw) => mapApiToEvent(event));
    } catch (error) {
      console.error(error);
    } finally {
      loading.tiketEvent = false;
    }
  }

  async function fetchAuthTiketEvent() {
    if (loading.tiketEvent) return;
    loading.tiketEvent = true;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get("/get-default?type=homepage");
      const rawEvents = Array.isArray(res.data?.event) ? res.data.event : [];
      const rawLogs = Array.isArray(res.data?.logs) ? res.data.logs : [];

      tiketEvent.value = rawEvents
        .filter((event: ApiEventRaw) => event.Status !== 'inactive')
        .map((event: ApiEventRaw) => mapApiToEvent(event));
      userLogs.value = rawLogs;
    } catch (error) {
      console.error(error);
    } finally {
      loading.tiketEvent = false;
    }
  }

  async function fetchAdminTiketEvent() {
    if (loading.adminTiketEvent) return;
    loading.adminTiketEvent = true;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get("/get-default?type=event");
      const data = res.data?.event || res.data;
      adminTiketEvent.value = Array.isArray(data) ? data.map(mapApiToEvent) : [];
    } catch (error) {
      console.error(error);
    } finally {
      loading.adminTiketEvent = false;
    }
  }

  async function fetchPublicEventDetail(SK: string) {
    loading.detailPublic = true;
    currentPublicEventDetail.value = null;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get(`/get-view?type=event&sk=${SK}`);
      const data = res.data?.event || res.data;
      const eventRaw = Array.isArray(data) ? (data.find(e => String(e.SK) === SK) || data[0]) : data;

      if (eventRaw) {
        if (eventRaw.Status === 'inactive') throw new Error("Event ini sedang tidak aktif.");
        currentPublicEventDetail.value = mapApiToEvent(eventRaw);
      } else {
        throw new Error("Event tidak ditemukan");
      }
    } catch (error: any) {
      useToastStore().showToast({ message: error.message || "Gagal mengambil event", type: "danger" });
    } finally {
      loading.detailPublic = false;
    }
  }

  async function fetchEventDetail(SK: string) {
    loading.detail = true;
    currentEventDetail.value = null;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get(`/get-default?type=event&sk=${SK}`);
      const data = res.data?.event || res.data;
      const eventRaw = Array.isArray(data) ? (data.find(e => String(e.SK) === SK) || data[0]) : data;
      if (eventRaw) currentEventDetail.value = mapApiToEvent(eventRaw);
    } catch (error) {
      console.error(error);
    } finally {
      loading.detail = false;
    }
  }

  async function addTiketEventBasic(eventData: Omit<EventBasicData, "SK">): Promise<boolean> {
    const token = useCookie("AccessToken").value;
    if (!token) return false;
    loading.savingBasic = true;
    const toast = useToastStore();
    try {
      const { $apiBase } = useNuxtApp() as any;
      const payload = createEventPayload(eventData as EventBasicData, token);
      const res = await $apiBase.post("/input-default?type=event", payload);
      const newEventData = res.data?.event || res.data;
      if (newEventData?.SK) {
        adminTiketEvent.value.unshift(mapApiToEvent(newEventData));
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

  async function updateTiketEventBasic(eventData: Partial<EventBasicData> & { SK: string }): Promise<boolean> {
    const token = useCookie("AccessToken").value;
    if (!token || !eventData.SK) return false;
    loading.savingBasic = true;
    const toast = useToastStore();
    
    const currentEvent = adminTiketEvent.value.find(d => d.SK === eventData.SK) || currentEventDetail.value;
    if (!currentEvent) {
      loading.savingBasic = false;
      toast.showToast({ message: "Data event tidak ditemukan.", type: "danger" });
      return false;
    }

    try {
      const { $apiBase } = useNuxtApp() as any;
      const mergedData: EventBasicData = {
        ...currentEvent,
        ...eventData,
        SK: currentEvent.SK as string
      };
      const payload = createEventPayload(mergedData, token, currentEvent.Date || {});
      await $apiBase.put(`/update-default?type=event&sk=${eventData.SK}`, payload);

      const updateLocal = (target: Event) => {
        Object.assign(target, { ...mergedData, Title: capitalizeText(mergedData.Title) });
      };

      const targetInList = adminTiketEvent.value.find(d => d.SK === eventData.SK);
      if (targetInList) updateLocal(targetInList);
      if (currentEventDetail.value?.SK === eventData.SK) updateLocal(currentEventDetail.value);

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
        const target = adminTiketEvent.value.find(d => d.SK === eventSK);
        if (target) target.Picture = newPic;
        if (currentEventDetail.value?.SK === eventSK) currentEventDetail.value.Picture = newPic;
      }
      useToastStore().showToast({ message: "Foto diperbarui.", type: "success" });
      return true;
    } catch {
      return false;
    } finally {
      loading.uploadPhoto = false;
    }
  }

  async function deleteTiketEvent(SK: string) {
    const token = useCookie("AccessToken").value;
    if (!token) return;
    try {
      const { $apiBase } = useNuxtApp() as any;
      await $apiBase.delete(`/delete-default?pk=event&sk=${SK}`, { data: { AccessToken: token } });
      adminTiketEvent.value = adminTiketEvent.value.filter(d => d.SK !== SK);
      tiketEvent.value = tiketEvent.value.filter(d => d.SK !== SK);
      useToastStore().showToast({ message: "Event dihapus.", type: "success" });
    } catch (error) {
      console.error(error);
    }
  }

  function decrementQuota(sk: string, total: number, ikhwan: number, akhwat: number) {
    const sub = (val: any, amt: number) => (val === 'non-quota' ? 'non-quota' : Math.max(0, Number(val) - amt));
    
    const apply = (target: Event | null) => {
      if (!target || target.SK !== sk) return;
      target.Quota_Total = sub(target.Quota_Total, total);
      target.Quota_Ikhwan = sub(target.Quota_Ikhwan, ikhwan);
      target.Quota_Akhwat = sub(target.Quota_Akhwat, akhwat);
    };

    apply(tiketEvent.value.find(e => e.SK === sk) || null);
    apply(currentPublicEventDetail.value);
  }

  return {
    searchQuery, loading, tiketEvent, adminTiketEvent, userLogs,
    currentEventDetail, currentPublicEventDetail,
    filteredTiketEvent, tiketEventChunks, filteredAdminTiketEvent,
    setSearchQuery, fetchPublicTiketEvent, fetchAuthTiketEvent,
    fetchAdminTiketEvent, fetchPublicEventDetail, fetchEventDetail,
    addTiketEventBasic, updateTiketEventBasic, uploadEventPhoto,
    deleteTiketEvent, decrementQuota, isNonQuota, getGenderLabel, 
    showTotal, showIkhwan, showAkhwat, getRemaining, formatQuota, 
    totalQuotaDisplay, registrationStatus
  };
});