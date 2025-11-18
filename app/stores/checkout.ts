// app/stores/checkout.ts

import { defineStore } from 'pinia';
import type { Dauroh } from '~/stores/dauroh';
import { useStorage } from '@vueuse/core';
import { useNuxtApp } from '#app'; // <-- Import useNuxtApp

// Tipe data untuk satu peserta dari modal
interface Participant {
  name: string;
  email: string;
  gender: string;
}

// Tipe untuk detail transaksi
interface TransactionDetails {
  vaNumber: string;
  amount: number;
  paymentMethod: string;
  expiryTime: number; // Timestamp
}

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    dauroh: useStorage<Dauroh | null>('checkout_dauroh', null, sessionStorage),
    participants: useStorage<Participant[]>('checkout_participants', [], sessionStorage),
    paymentMethod: useStorage<string | null>('checkout_payment_method', null, sessionStorage),
    transactionDetails: useStorage<TransactionDetails | null>('checkout_transaction', null, sessionStorage),
    voucherCode: useStorage<string | null>('checkout_voucher_code', null, sessionStorage),
    discountAmount: useStorage<number>('checkout_discount_amount', 0, sessionStorage),
  }),

  getters: {
    // Menghitung total biaya berdasarkan jumlah peserta dan harga tiket
    totalAmount(state): number {
      if (!state.dauroh || !state.participants) {
        return 0;
      }
      return (state.dauroh.Price || 0) * state.participants.length;
    },
    finalAmount(state): number {
      const total = (state.dauroh?.Price || 0) * state.participants.length;
      const final = total - state.discountAmount;
      return final < 0 ? 0 : final; // Pastikan total tidak minus
    },
  },

  actions: {
    // 1. Dipanggil saat user submit modal registrasi
    startCheckout(registrationData: { dauroh: Dauroh; participants: Participant[] }) {
      this.dauroh = registrationData.dauroh;
      this.participants = registrationData.participants;
      this.paymentMethod = null;
      this.transactionDetails = null;
      this.voucherCode = null; // Reset voucher saat memulai checkout baru
      this.discountAmount = 0;
      // --- AKHIR ---
    },

    // 2. Dipanggil saat user memilih bank di halaman 'select'
    setPaymentMethod(method: string) {
      this.paymentMethod = method;
    },
    // Aksi untuk menyimpan hasil validasi voucher
    setVoucher(code: string | null, amount: number) {
      this.voucherCode = code;
      this.discountAmount = amount;
    },

    // 3. Dipanggil saat user klik "Bayar" di halaman 'summary'
    async createPayment() {
      // const { $apiBase } = useNuxtApp();
      
      // // UNCOMMENT INI UNTUK INTEGRASI BACKEND
      // const response = await $apiBase.post('/api/create-payment', {
      //   daurohId: this.dauroh?.sk,
      //   participants: this.participants,
      //   paymentMethod: this.paymentMethod,
      //   voucherCode: this.voucherCode, // <-- Kirim voucher code
      //   finalAmount: this.finalAmount   // <-- Kirim total akhir
      // });
      // this.transactionDetails = response.data;
      // return true;
      console.log("Membuat pembayaran dengan detail:", {
        daurohId: this.dauroh?.sk,
        paymentMethod: this.paymentMethod,
        voucherCode: this.voucherCode,
        totalAmount: this.totalAmount,
        discountAmount: this.discountAmount,
        finalAmount: this.finalAmount,
      });

      this.transactionDetails = {
        vaNumber: '9888442365281', // Nomor VA palsu
        amount: this.finalAmount, // <-- PENTING: GANTI DARI totalAmount ke finalAmount
        paymentMethod: this.paymentMethod || 'BSI',
        expiryTime: Date.now() + 24 * 60 * 60 * 1000 // 24 jam dari sekarang
      };
      
      return true;
    },

    // 4. Untuk membersihkan store setelah selesai atau batal
    clearCheckout() {
      this.dauroh = null;
      this.participants = [];
      this.paymentMethod = null;
      this.transactionDetails = null;
      this.voucherCode = null;
      this.discountAmount = 0;
    }
  }
});