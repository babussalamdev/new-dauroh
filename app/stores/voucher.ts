// app/stores/voucher.ts

import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import Swal from 'sweetalert2';
import { useToastStore } from './toast';

// Tipe data untuk 1 voucher
export interface Voucher {
  SK: string; // Kode unik voucher
  Status: 'UNUSED' | 'USED'; // Statusnya
  Expired: string; // Tanggal kadaluwarsa (string)
  DiscountType: 'PERCENT' | 'FIXED'; // Tipe diskon
  DiscountValue: number; // Nilai diskonnya (misal: 20 untuk 20% atau 50000 untuk 50rb)
  UsedBy?: string; // Email yang menggunakan (opsional)
}

// Tipe data untuk form generate
export interface GenerateVoucherPayload {
  quantity: number; // <-- Tambahan: Jumlah voucher yang mau dibuat
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  expiresAt: string; // Format YYYY-MM-DD
}

export const useVoucherStore = defineStore('voucher', {
  state: () => ({
    vouchers: [] as Voucher[],
    loading: false,
    loadingGenerate: false,
  }),

  getters: {
    // Sortir data terbaru di atas
    sortedVouchers(state): Voucher[] {
      return [...state.vouchers].sort((a, b) => b.SK.localeCompare(a.SK));
    },
  },

  actions: {
    async fetchVouchers() {
      this.loading = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      try {
        // const response = await $apiBase.get('/admin/vouchers');
        // this.vouchers = response.data;
        
        // --- SIMULASI DATA DUMMY ---
        await new Promise(resolve => setTimeout(resolve, 500));
        if (this.vouchers.length === 0) {
           this.vouchers = [
             { SK: 'ABC123', Status: 'USED', Expired: '2025-12-31', DiscountType: 'PERCENT', DiscountValue: 20, UsedBy: 'user@example.com' },
             { SK: 'DEF456', Status: 'UNUSED', Expired: '2025-12-31', DiscountType: 'PERCENT', DiscountValue: 20 },
             { SK: 'GHI789', Status: 'UNUSED', Expired: '2025-12-31', DiscountType: 'FIXED', DiscountValue: 50000 },
           ];
        }
        // --- AKHIR SIMULASI ---

      } catch (error: any) {
        toastStore.showToast({
          message: `Gagal memuat voucher: ${error.message}`,
          type: 'danger',
        });
      } finally {
        this.loading = false;
      }
    },

    async generateVouchers(payload: GenerateVoucherPayload) {
      this.loadingGenerate = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      try {
        // // Panggil API untuk men-generate voucher massal
        // const response = await $apiBase.post('/admin/vouchers/generate', payload);
        // // 'response.data' harusnya adalah array berisi voucher-voucher baru
        // this.vouchers.unshift(...response.data); 

        // --- SIMULASI GENERATE MASSAL ---
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newVouchers: Voucher[] = [];
        
        // Loop sesuai quantity yang diminta
        for (let i = 0; i < payload.quantity; i++) {
          newVouchers.push({
            // Generate random code: misal "VOU-XK9Z"
            SK: `VOU-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(Math.random() * 100)}`,
            Status: 'UNUSED',
            Expired: payload.expiresAt,
            DiscountType: payload.discountType,
            DiscountValue: payload.discountValue,
          });
        }
        
        this.vouchers.unshift(...newVouchers); // Tambah semua ke state
        // --- AKHIR SIMULASI ---
        
        toastStore.showToast({
          message: `Berhasil membuat ${payload.quantity} voucher baru!`,
          type: 'success',
        });
        return true; // Sukses

      } catch (error: any) {
        Swal.fire('Gagal Membuat', error.message || 'Terjadi kesalahan', 'error');
        return false; // Gagal
      } finally {
        this.loadingGenerate = false;
      }
    },

    async deleteVoucher(sk: string) {
      const toastStore = useToastStore();

      // Konfirmasi dulu
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
          // await $apiBase.delete(`/admin/vouchers/${sk}`);
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulasi

          // Hapus dari state
          this.vouchers = this.vouchers.filter(v => v.SK !== sk);
          toastStore.showToast({ message: 'Voucher berhasil dihapus.', type: 'success' });

        } catch (error: any) {
          Swal.fire('Gagal Menghapus', error.message || 'Terjadi kesalahan', 'error');
        }
      }
    },
  },
});