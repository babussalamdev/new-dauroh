// app/stores/checkout.ts

import { defineStore } from 'pinia';
import type { Dauroh } from '~/stores/dauroh';
import { useStorage } from '@vueuse/core';

// Tipe data untuk satu peserta dari modal
interface Participant {
  name: string;
  email: string;
  gender: string;
}

// Tipe untuk detail transaksi (hasil palsu dari API)
interface TransactionDetails {
  vaNumber: string;
  amount: number;
  paymentMethod: string;
  expiryTime: number; // Timestamp
}

export const useCheckoutStore = defineStore('checkout', {
  // Kita gunakan sessionStorage agar data tidak hilang jika user me-refresh halaman
  // di tengah-tengah proses checkout.
  state: () => ({
    dauroh: useStorage<Dauroh | null>('checkout_dauroh', null, sessionStorage),
    participants: useStorage<Participant[]>('checkout_participants', [], sessionStorage),
    paymentMethod: useStorage<string | null>('checkout_payment_method', null, sessionStorage),
    transactionDetails: useStorage<TransactionDetails | null>('checkout_transaction', null, sessionStorage),
  }),

  getters: {
    // Menghitung total biaya berdasarkan jumlah peserta dan harga tiket
    totalAmount(state): number {
      if (!state.dauroh || !state.participants) {
        return 0;
      }
      return (state.dauroh.Price || 0) * state.participants.length;
    },
  },

  actions: {
    // 1. Dipanggil saat user submit modal registrasi
    startCheckout(registrationData: { dauroh: Dauroh; participants: Participant[] }) {
      this.dauroh = registrationData.dauroh;
      this.participants = registrationData.participants;
      this.paymentMethod = null;
      this.transactionDetails = null;
    },

    // 2. Dipanggil saat user memilih bank di halaman 'select'
    setPaymentMethod(method: string) {
      this.paymentMethod = method;
    },

    // 3. Dipanggil (disimulasikan) saat user klik "Bayar" di halaman 'summary'
    async createPayment() {
      // Di sinilah kita akan memanggil API untuk membuat transaksi
      // const { $apiBase } = useNuxtApp();
      // const response = await $apiBase.post('/api/create-payment', {
      //   daurohId: this.dauroh?.sk,
      //   participants: this.participants,
      //   paymentMethod: this.paymentMethod,
      // });
      
      // SIMULASI: Anggaplah API mengembalikan data ini
      this.transactionDetails = {
        vaNumber: '9888442365281', // Nomor VA palsu
        amount: this.totalAmount,
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
    }
  }
});