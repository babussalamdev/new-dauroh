import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { useNuxtApp, useCookie } from "#app";
import { ref, computed } from "vue";
import { usePagination } from "~/composables/usePagination";
import { useGlobalEventStore } from '~/stores/globalEvent';

export const useVoucherStore = defineStore("voucher", () => {
  // STATE
   const voucher = ref<any[]>([]);
  const loading = ref(false);
  const search = ref("");
  const form = ref({
    jumlah: "",
    nominal: "",
    hari: ""
  });

  // GETTERS (Computed)

  const filteredData = computed(() => {
    if (!search.value) return voucher.value;
    return voucher.value.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(search.value.toLowerCase())
      )
    );
  });

  const { 
    perPage, 
    currentPage, 
    totalItems, 
    totalPages, 
    paginatedData, 
    changePage 
  } = usePagination(filteredData);

 
  // ACTIONS
  function resetForm() {
    form.value = { jumlah: "", nominal: "", hari: "" };
  }



  async function fetchVouchers() {
    const globalStore = useGlobalEventStore();
    if (!globalStore.activeEventSK) return;

    loading.value = true;
    const { $apiBase } = useNuxtApp();
    try {
      const res: any = await $apiBase.get(`/get-voucher?type=load-voucher&eventSK=${globalStore.activeEventSK}`);
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
    const globalStore = useGlobalEventStore();

    if (!globalStore.activeEventSK) {
      Swal.fire({ icon: "warning", title: "Harap pilih Event di Dashboard terlebih dahulu!", showConfirmButton: false, timer: 1500 });
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
        eventSK: globalStore.activeEventSK,
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

async function deleteVoucherBulk(selectedSKs: string[]) {
    const globalStore = useGlobalEventStore();

    if (!globalStore.activeEventSK) {
      Swal.fire({ icon: "error", title: "Error", text: "Event aktif tidak ditemukan.", showConfirmButton: false, timer: 1500 });
      return false;
    }

    loading.value = true;
    try {
      const { $apiBase } = useNuxtApp();
      const token = useCookie("AccessToken");

      const rawPK = `voucher#${globalStore.activeEventSK}`;
      const payloadData = selectedSKs.map(sk => ({
        PK: rawPK,
        SK: sk
      }));

      const res: any = await $apiBase.delete('/delete-voucher', {
        data: payloadData, //[{PK, SK}, {PK, SK}]
        headers: {
          Authorization: `Bearer ${token.value}` 
        }
      });

      if (res) {
      
        voucher.value = voucher.value.filter(v => !selectedSKs.includes(v.SK));

        Swal.fire({ icon: "success", title: `${selectedSKs.length} Voucher dihapus!`, showConfirmButton: false, timer: 1500 });
        return true;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Gagal menghapus voucher";
      Swal.fire({ icon: "error", title: msg, showConfirmButton: false, timer: 1500 });
      return false;
    } finally {
      loading.value = false;
    }
  }


  return {
    // State
    voucher,
    loading,
    search,
    form,

    // Getters
    filteredData,
    perPage,
    currentPage,
    totalItems,
    totalPages,
    paginatedData,

    // Actions
    changePage,
    resetForm,
    fetchVouchers,
    inputVoucher,
    deleteVoucherBulk
  };
});