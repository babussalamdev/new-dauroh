// app/stores/checkout.ts

import { defineStore } from 'pinia';
import type { Dauroh } from '~/stores/dauroh';
import { useStorage } from '@vueuse/core';
import { useNuxtApp } from '#app';
import { useAuth } from '~/composables/useAuth';

// ... (Interface Participant & TransactionDetails TETAP SAMA, TIDAK PERLU DIUBAH) ...
interface Participant {
  Name: string;
  Email: string;
  Gender: string;
  Age: number | string;
  Domicile: string;
}

interface TransactionDetails {
  link_id?: string;
  link_url?: string;
  amount?: number;
  status?: string;
}

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    dauroh: useStorage<Dauroh | null>('checkout_dauroh', null, sessionStorage),
    participants: useStorage<Participant[]>('checkout_participants', [], sessionStorage),
    paymentMethod: useStorage<string | null>('checkout_payment_method', null, sessionStorage),
    transactionDetails: useStorage<TransactionDetails | null>('checkout_transaction', null, sessionStorage),
    voucherCode: useStorage<string | null>('checkout_voucher_code', null, sessionStorage),
    discountAmount: useStorage<number>('checkout_discount_amount', 0, sessionStorage),
    isLoading: false,
  }),

  getters: {
    totalAmount(state): number {
      if (!state.dauroh || !state.participants) return 0;
      return (state.dauroh.Price || 0) * state.participants.length;
    },
    finalAmount(state): number {
      const total = (state.dauroh?.Price || 0) * state.participants.length;
      const final = total - state.discountAmount;
      return final < 0 ? 0 : final;
    },
  },

  actions: {
    startCheckout(registrationData: { dauroh: Dauroh; participants: Participant[] }) {
      this.dauroh = registrationData.dauroh;
      this.participants = registrationData.participants;
      this.paymentMethod = null;
      this.transactionDetails = null;
      this.voucherCode = null;
      this.discountAmount = 0;
    },

    setPaymentMethod(method: string) {
      this.paymentMethod = method;
    },
    
    setVoucher(code: string | null, amount: number) {
      this.voucherCode = code;
      this.discountAmount = amount;
    },

    async createPayment() {
      this.isLoading = true;
      
      // [PERUBAHAN 1] Ambil $apiFlip (Plugin baru kita)
      const { $apiFlip } = useNuxtApp(); 
      const { accessToken, user } = useAuth();

      try {
        // 1. Transform Array Peserta ke Object Person (PascalCase)
        const objectPerson: Record<string, any> = {};
        
        this.participants.forEach((p, index) => {
          objectPerson[`person${index + 1}`] = {
            Name: p.Name,           
            Gender: p.Gender.toLowerCase(), // Backend minta lowercase (ikhwan/akhwat)
            Age: Number(p.Age),
            Domicile: p.Domicile
          };
        });

        // 2. Susun Payload Utama
        const payload = {
            Amount: String(this.finalAmount),
            Name: user.value?.name || 'Guest',
            Bank: this.paymentMethod?.toLowerCase() || 'bsi',
            EventSK: this.dauroh?.SK,
            objectPerson: objectPerson, 
            AccessToken: accessToken.value // Token tetap diambil dari Auth user
        };

        console.log("Payload Flip:", payload);

        // [PERUBAHAN 2] Gunakan $apiFlip, bukan $apiBase
        // Endpointnya cukup '/flip-dauroh' karena base URL-nya sudah mengarah ke '/prod/'
        const response = await $apiFlip.post('/flip-dauroh', payload);
        
        this.transactionDetails = response.data; 

        return { success: true, data: response.data };

      } catch (error: any) {
        console.error("Payment Flip Error:", error);
        
        let errorMessage = "Terjadi kesalahan saat memproses pembayaran.";
        if (error.response && error.response.data) {
           errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        }

        return { success: false, message: errorMessage, error: error };
      } finally {
        this.isLoading = false;
      }
    },

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