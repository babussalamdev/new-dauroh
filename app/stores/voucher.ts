import { defineStore } from "pinia";
import Swal from "sweetalert2"; 
import { useNuxtApp, useCookie } from "#app";
import { ref, computed } from "vue";
import { usePagination } from "~/composables/usePagination";
import { useGlobalEventStore } from '~/stores/globalEvent';
import { useAlert } from '~/utils/swal';

export const useVoucherStore = defineStore("voucher", () => {
  const { alert: swalAlert } = useAlert(); // 🟢 Deklarasikan alert
  
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
    const { $apiBase } = useNuxtApp() as any;
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
      // 🟢 Pake swalAlert tipe warning
      swalAlert("Oops", "Harap pilih Event di Dashboard terlebih dahulu!", "warning");
      return false;
    }

    loading.value = true;
    const { $apiBase } = useNuxtApp() as any;
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

        // 🟢 Feedback Sukses yang halus
        swalAlert("Berhasil", `Berhasil membuat ${form.value.jumlah} voucher!`, "success");
        resetForm();
        return true;
      }
    } catch (error: any) {
      // 🟢 Handling error dengan fallback pesan
      swalAlert("Gagal", error.response?.data?.message || "Gagal membuat voucher", "error");
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteVoucherBulk(selectedSKs: string[]) {
    const globalStore = useGlobalEventStore();

    if (!globalStore.activeEventSK) {
      swalAlert("Error", "Event aktif tidak ditemukan.", "error");
      return false;
    }

    // 🟢 Tampilkan loading manual karena ini proses bulk
    Swal.fire({
      title: 'Menghapus Voucher...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    loading.value = true;
    try {
      const { $apiBase } = useNuxtApp() as any;
      const token = useCookie("AccessToken");

      const rawPK = `voucher#${globalStore.activeEventSK}`;
      const payloadData = selectedSKs.map(sk => ({
        PK: rawPK,
        SK: sk
      }));

      const res: any = await $apiBase.delete('/delete-voucher', {
        data: payloadData,
        headers: {
          Authorization: `Bearer ${token.value}` 
        }
      });

      if (res) {
        voucher.value = voucher.value.filter(v => !selectedSKs.includes(v.SK));
        Swal.close(); // Tutup loading
        
        // 🟢 Beri feedback sukses
        swalAlert("Terhapus!", `${selectedSKs.length} Voucher telah dihapus.`, "success");
        return true;
      }
    } catch (error: any) {
      Swal.close();
      const msg = error.response?.data?.message || error.message || "Gagal menghapus voucher";
      swalAlert("Gagal", msg, "error");
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    voucher, loading, search, form,
    filteredData, perPage, currentPage, totalItems, totalPages, paginatedData,
    changePage, resetForm, fetchVouchers, inputVoucher, deleteVoucherBulk
  };
});