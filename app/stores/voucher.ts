import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { useNuxtApp, useCookie } from "#app";
import { ref, computed } from "vue";

export const useVoucherStore = defineStore("voucher", () => {
  // =========================================================
  // STATE
  // =========================================================
  const voucher = ref<any[]>([]);
  const events = ref<any[]>([]);
  const selectedEventSK = ref("");
  const loading = ref(false);
  const search = ref("");
  const perPage = ref(10);
  const currentPage = ref(1);
  const showModalAdd = ref(false);
  const form = ref({
    jumlah: "",
    nominal: "",
    hari: ""
  });

  // =========================================================
  // GETTERS (Computed)
  // =========================================================
  const filteredData = computed(() => {
    if (!search.value) return voucher.value;
    return voucher.value.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(search.value.toLowerCase())
      )
    );
  });

  const totalItems = computed((): number => {
    return filteredData.value.length;
  });

  const totalPages = computed((): number => {
    return Math.ceil(totalItems.value / perPage.value) || 1;
  });

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return filteredData.value.slice(start, start + perPage.value);
  });

  // =========================================================
  // ACTIONS
  // =========================================================
  function changePage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }

  function resetForm() {
    form.value = { jumlah: "", nominal: "", hari: "" };
  }

  async function fetchEvents() {
    const { $apiBase } = useNuxtApp();
    try {
      const res: any = await $apiBase.get('/get-voucher?type=load-event');
      if (Array.isArray(res.data)) {
        events.value = res.data;
      }
    } catch (error) {
      console.error("Gagal memuat event:", error);
    }
  }

  async function fetchVouchers() {
    if (!selectedEventSK.value) return;

    loading.value = true;
    const { $apiBase } = useNuxtApp();
    try {
      const res: any = await $apiBase.get(`/get-voucher?type=load-voucher&eventSK=${selectedEventSK.value}`);
      voucher.value = Array.isArray(res.data) ? res.data : [];
      currentPage.value = 1;
    } catch (error) {
      console.error("Gagal memuat voucher:", error);
      voucher.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function inputVoucher() {
    if (!selectedEventSK.value) {
      Swal.fire({ icon: "warning", title: "Harap pilih Event terlebih dahulu!", showConfirmButton: false, timer: 1500 });
      return false;
    }

    loading.value = true;
    const { $apiBase } = useNuxtApp();
    const token = useCookie("AccessToken");

    try {
      const payload = {
        Hari: String(form.value.hari),
        Nominal: String(form.value.nominal),
        Jumlah: String(form.value.jumlah),
        eventSK: selectedEventSK.value,
        AccessToken: token.value || "",
      };

      const res: any = await $apiBase.post('/create-voucher', payload);

      if (res) {
        const data = res.data;
        if (Array.isArray(data)) {
          voucher.value.push(...data);
        } else if (data) {
          voucher.value.push(data);
        }

        Swal.fire({ icon: "success", title: `Berhasil membuat ${form.value.jumlah} voucher!`, showConfirmButton: false, timer: 1500 });
        resetForm();
        return true;
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: error.response?.data?.message || "Gagal membuat voucher", showConfirmButton: false, timer: 1500 });
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteVoucher(SK: string) {
    try {
      const { $apiBase } = useNuxtApp();
      const token = useCookie("AccessToken");

      const currentData = voucher.value.find((x) => x.SK === SK);
      if (!currentData) return;
      if (!selectedEventSK.value) {
        throw new Error("Event SK hilang. Silakan refresh halaman.");
      }

      const rawPK = `voucher#${selectedEventSK.value}`;
      const PK = encodeURIComponent(rawPK);

      const result = await Swal.fire({
        title: "Hapus Voucher?",
        text: `Kode ${currentData.SK} akan dihapus permanen!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: `Ya, Hapus!`,
        cancelButtonText: "Batal"
      });

      if (result.isConfirmed) {
        const res: any = await $apiBase.delete(`/delete-voucher?type=single&pk=${PK}&sk=${SK}`, {
          data: { AccessToken: token.value || "" }
        });
        if (res) {
          const index = voucher.value.findIndex((v) => v.SK === SK);
          if (index !== -1) {
            voucher.value.splice(index, 1);
          }

          Swal.fire({ icon: "success", title: `Voucher berhasil dihapus!`, showConfirmButton: false, timer: 1500 });
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Gagal menghapus voucher";
      Swal.fire({ icon: "error", title: msg, showConfirmButton: false, timer: 1500 });
    }
  }

  // =========================================================
  // RETURN SEMUA AGAR BISA DIAKSES DI KOMPONEN
  // =========================================================
  return {
    // State
    voucher,
    events,
    selectedEventSK,
    loading,
    search,
    perPage,
    currentPage,
    showModalAdd,
    form,

    // Getters
    filteredData,
    totalItems,
    totalPages,
    paginatedData,

    // Actions
    changePage,
    resetForm,
    fetchEvents,
    fetchVouchers,
    inputVoucher,
    deleteVoucher
  };
});