// app/stores/voucher.ts

import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import Swal from 'sweetalert2';
import { useToastStore } from './toast';

// Tipe data Voucher
export interface Voucher {
  SK: string;
  Status: string;
  Expired: string;
  Diskon: number;
  User: string;
}

// Tipe data Event untuk Dropdown
export interface VoucherEvent {
  SK: string;
  Title: string;
}

// Payload untuk create voucher
export interface GenerateVoucherPayload {
  jumlah: number;
  nominal: number;
  hari: number;
}

export const useVoucherStore = defineStore('voucher', {
  state: () => ({
    vouchers: [] as Voucher[],
    events: [] as VoucherEvent[], // State untuk menampung list event
    selectedEventSK: '' as string, // State untuk event yang dipilih
    loading: false,
    loadingGenerate: false,
  }),

  getters: {
    sortedVouchers(state): Voucher[] {
      return [...state.vouchers];
    },
  },

  actions: {
    // 1. Fetch List Event (Dipanggil saat load page)
    async fetchEvents() {
      const { $apiBase } = useNuxtApp();
      try {
        const response = await $apiBase.get('/get-voucher?type=load-event');
        if (Array.isArray(response.data)) {
          this.events = response.data.map((e: any) => ({
            SK: e.SK,
            Title: e.Title
          }));
        }
      } catch (error) {
        console.error("Gagal memuat event:", error);
      }
    },

    // 2. Fetch Vouchers berdasarkan Event yang dipilih
    async fetchVouchers() {
      // Jika belum pilih event, kosongkan data & return
      if (!this.selectedEventSK) {
        this.vouchers = [];
        return;
      }

      this.loading = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      
      try {
        // GET API dengan parameter eventSK sesuai request
        const response = await $apiBase.get(`/get-voucher?type=load-voucher&eventSK=${this.selectedEventSK}`);
        
        if (Array.isArray(response.data)) {
             this.vouchers = response.data.map((v: any) => ({
                SK: v.SK,
                Status: v.Status || 'inactive',
                Expired: v.Expired || '-',
                Diskon: Number(v.Nominal || v.Diskon || 0),
                User: v.User || '-'
             }));
        } else {
            this.vouchers = [];
        }

      } catch (error: any) {
        console.error("Fetch Voucher Error:", error);
        this.vouchers = [];
        toastStore.showToast({
          message: `Gagal memuat voucher.`,
          type: 'danger',
        });
      } finally {
        this.loading = false;
      }
    },

    // 3. Generate Voucher (FIXED: Kirim eventSK di BODY)
    async generateVouchers(payload: GenerateVoucherPayload) {
      if (!this.selectedEventSK) {
          Swal.fire('Error', 'Silakan pilih event terlebih dahulu.', 'warning');
          return false;
      }

      this.loadingGenerate = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      
      const accessToken = useCookie("AccessToken").value;
      if (!accessToken) {
         Swal.fire('Error', 'Sesi habis, silakan login ulang.', 'error');
         this.loadingGenerate = false;
         return false;
      }

      try {
        // Payload Body sesuai Postman (eventSK masuk di body)
        const apiPayload = {
            Hari: String(payload.hari),
            Nominal: String(payload.nominal),
            Jumlah: String(payload.jumlah),
            eventSK: this.selectedEventSK, // Wajib ada agar masuk ke event yang benar
            AccessToken: accessToken
        };

        await $apiBase.post('/create-voucher', apiPayload);
        
        toastStore.showToast({
          message: `Berhasil membuat ${payload.jumlah} voucher baru!`,
          type: 'success',
        });
        
        // Refresh tabel otomatis setelah sukses
        await this.fetchVouchers();
        return true;

      } catch (error: any) {
        console.error("Create Voucher Error:", error);
        const msg = error.response?.data?.message || error.message || 'Terjadi kesalahan';
        Swal.fire('Gagal Membuat', msg, 'error');
        return false;
      } finally {
        this.loadingGenerate = false;
      }
    },

    // 4. Delete Voucher
    async deleteVoucher(sk: string) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      const accessToken = useCookie("AccessToken").value;

      if (!accessToken) return;

      const result = await Swal.fire({
        title: 'Hapus Voucher?',
        text: `Kode "${sk}" akan dihapus permanen!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
      });

      if (result.isConfirmed) {
        try {
          // Sesuai request: delete-voucher?type=single&pk&sk=...
          // pk dikirim kosong (&pk=&sk=...) atau cukup key-nya saja
          await $apiBase.delete(`/delete-voucher?type=single&pk=&sk=${sk}`, {
             data: { AccessToken: accessToken }
          });

          this.vouchers = this.vouchers.filter(v => v.SK !== sk);
          toastStore.showToast({ message: 'Voucher berhasil dihapus.', type: 'success' });

        } catch (error: any) {
           console.error("Delete Voucher Error:", error);
           Swal.fire('Gagal Menghapus', 'Terjadi kesalahan saat menghapus.', 'error');
        }
      }
    },
  },
});