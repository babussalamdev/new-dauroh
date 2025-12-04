import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { useNuxtApp, useCookie } from "#app";

export const useVoucherStore = defineStore("voucher", {
  state: () => ({
    // Data Utama
    vouchers: [] as any[],
    events: [] as any[],
    selectedEventSK: "", 
    
    // UI States
    loading: false,
    search: "",
    perPage: 10,
    currentPage: 1,
    showModalAdd: false,

    // Form State
    form: {
      jumlah: "",
      nominal: "",
      hari: ""
    },
  }),

  getters: {
    filteredData: (state) => {
      if (!state.search) return state.vouchers;
      return state.vouchers.filter((item) =>
        Object.values(item).some((val) => 
          String(val).toLowerCase().includes(state.search.toLowerCase())
        )
      );
    },
    
    totalItems(): number { return this.filteredData.length; },
    totalPages(): number { return Math.ceil(this.totalItems / this.perPage) || 1; },
    paginatedData(): any[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredData.slice(start, start + this.perPage);
    }
  },

  actions: {
    changePage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    resetForm() {
      this.form = { jumlah: "", nominal: "", hari: "" };
    },

    async fetchEvents() {
      const { $apiBase } = useNuxtApp();
      try {
        const res = await $apiBase.get('/get-voucher?type=load-event');
        if (Array.isArray(res.data)) {
          this.events = res.data;
        }
      } catch (error) {
        console.error("Gagal memuat event:", error);
      }
    },

    async fetchVouchers() {
      if (!this.selectedEventSK) return;
      
      this.loading = true;
      const { $apiBase } = useNuxtApp();
      
      try {
        const res = await $apiBase.get(`/get-voucher?type=load-voucher&eventSK=${this.selectedEventSK}`);
        this.vouchers = Array.isArray(res.data) ? res.data : [];
        this.currentPage = 1;
      } catch (error) {
        console.error("Gagal memuat voucher:", error);
        this.vouchers = [];
      } finally {
        this.loading = false;
      }
    },

    async inputVoucher() {
      if (!this.selectedEventSK) {
        Swal.fire({ icon: "warning", title: "Harap pilih Event terlebih dahulu!", showConfirmButton: false, timer: 1500 });
        return false;
      }

      this.loading = true;
      const { $apiBase } = useNuxtApp();
      const token = useCookie("AccessToken");

      try {
        const payload = {
          Hari: String(this.form.hari),
          Nominal: String(this.form.nominal),
          Jumlah: String(this.form.jumlah),
          eventSK: this.selectedEventSK,
          AccessToken: token.value || "",
        };

        const res = await $apiBase.post('/create-voucher', payload);

        if (res) {
          const data = res.data;
          if (Array.isArray(data)) {
             this.vouchers.push(...data);
          } else if (data) {
             this.vouchers.push(data);
          }

          Swal.fire({ icon: "success", title: `Berhasil membuat ${this.form.jumlah} voucher!`, showConfirmButton: false, timer: 1500 });
          this.resetForm();
          return true;
        }
      } catch (error: any) {
        Swal.fire({ icon: "error", title: error.response?.data?.message || "Gagal membuat voucher", showConfirmButton: false, timer: 1500 });
        return false;
      } finally {
        this.loading = false;
      }
    },
    
async deleteVoucher(SK: string) {
      try {
        const { $apiBase } = useNuxtApp();
        const token = useCookie("AccessToken");

        // 1. Validasi Data Lokal
        const currentData = this.vouchers.find((x) => x.SK === SK);
        if (!currentData) return;
        if (!this.selectedEventSK) {
             throw new Error("Event SK hilang. Silakan refresh halaman.");
        }
        const rawPK = `voucher#${this.selectedEventSK}`;
        const PK = encodeURIComponent(rawPK);

        // 2. Konfirmasi Delete
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
          const res = await $apiBase.delete(`/delete-voucher?type=single&pk=${PK}&sk=${SK}`, {
             data: { AccessToken: token.value || "" }
          });
          if (res) {
            const index = this.vouchers.findIndex((v) => v.SK === SK);
            if (index !== -1) {
              this.vouchers.splice(index, 1); 
            }

            Swal.fire({
              icon: "success",
              title: `Voucher berhasil dihapus!`,
              showConfirmButton: false,
              timer: 1500,
            });
          }
        }
      } catch (error: any) {
        const msg = error.response?.data?.message || error.message || "Gagal menghapus voucher";
        Swal.fire({
          icon: "error",
          title: msg,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    },
  },
});