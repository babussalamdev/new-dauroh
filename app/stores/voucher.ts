// app/stores/voucher.ts

import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import Swal from 'sweetalert2';
import { useToastStore } from './toast'; // Asumsi lu punya toast store

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
  quantity: number;
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
    // Mirip `changeUnit` di referensi lu
    async fetchVouchers() {
      this.loading = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();
      try {
        // const response = await $apiBase.get('/admin/vouchers');
        // this.vouchers = response.data;
        
        // dummy
        await new Promise(resolve => setTimeout(resolve, 500));
        // isi data dummy biar keliatan di tabel
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

    // Mirip `submitInput` di referensi lu
    async generateVouchers(payload: GenerateVoucherPayload) {
      this.loadingGenerate = true;
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      try {
        // // Panggil API untuk men-generate voucher
        // const response = await $apiBase.post('/admin/vouchers/generate', payload);
        // // 'response.data' harusnya adalah array berisi voucher-voucher baru
        // this.vouchers.unshift(...response.data); // Tambah voucher baru ke atas list

        // --- SIMULASI (HAPUS JIKA API SUDAH READY) ---
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newVouchers: Voucher[] = [];
        for (let i = 0; i < payload.quantity; i++) {
          newVouchers.push({
            SK: `NEW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            Status: 'UNUSED',
            Expired: payload.expiresAt,
            DiscountType: payload.discountType,
            DiscountValue: payload.discountValue,
          });
        }
        this.vouchers.unshift(...newVouchers); // Tambah di awal array
        // --- AKHIR SIMULASI ---
        
        toastStore.showToast({
          message: `${payload.quantity} voucher baru berhasil dibuat!`,
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

    // Mirip `deleteItem` di referensi lu
    async deleteVoucher(sk: string) {
      const { $apiBase } = useNuxtApp();
      const toastStore = useToastStore();

      // Konfirmasi dulu
      const result = await Swal.fire({
        title: 'Anda yakin?',
        text: `Voucher "${sk}" akan dihapus permanen!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
      });

      if (result.isConfirmed) {
        try {
          // await $apiBase.delete(`/admin/vouchers/${sk}`);

          // --- SIMULASI (HAPUS JIKA API SUDAH READY) ---
          await new Promise(resolve => setTimeout(resolve, 500));
          // --- AKHIR SIMULASI ---

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