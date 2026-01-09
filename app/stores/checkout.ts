import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import { useAuth } from '~/composables/useAuth';

// --- INTERFACES ---
interface Participant {
  Name: string;
  Email: string;
  Gender: string;
  Age: number | string;
  Domicile: string;
}

interface Dauroh {
  SK: string;
  Price: number;
  Title: string; 
  [key: string]: any;
}

interface TransactionDetails {
  link_id?: string;
  link_url?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  vaNumber?: string;
  expiryTime?: string;
  [key: string]: any;
}

export const useCheckoutStore = defineStore('checkout', {
  // --- STATE ---
  // State murni, bersih, tanpa logic aneh-aneh
  state: () => ({
    dauroh: null as Dauroh | null,
    participants: [] as Participant[],
    
    paymentMethod: null as string | null,
    transactionDetails: null as TransactionDetails | null,
    
    voucherCode: null as string | null,
    discountAmount: 0,
    voucherApplied: false,
    
    isLoading: false,
  }),

  // --- GETTERS ---
  getters: {
    totalAmount(state): number {
      if (!state.dauroh || !state.participants) return 0;
      return (state.dauroh.Price || 0) * state.participants.length;
    },
    
    finalAmount(state): number {
      // @ts-ignore 
      const total = (state.dauroh?.Price || 0) * state.participants.length;
      const final = total - state.discountAmount;
      return final < 0 ? 0 : final; 
    },

    hasVoucher(state): boolean {
      return !!state.voucherCode && state.voucherApplied;
    }
  },

  // --- ACTIONS ---
  actions: {
    startCheckout(registrationData: { dauroh: Dauroh; participants: Participant[] }) {
      this.dauroh = registrationData.dauroh;
      this.participants = registrationData.participants;
      
      this.paymentMethod = null;
      this.transactionDetails = null;
      this.removeVoucher(); 
    },

    setPaymentMethod(method: string) {
      this.paymentMethod = method;
    },
    
    setVoucher(code: string, amount: number) {
      this.voucherCode = code;
      this.discountAmount = amount;
      this.voucherApplied = true;
    },

    removeVoucher() {
      this.voucherCode = null;
      this.discountAmount = 0;
      this.voucherApplied = false;
    },

    async createPayment() {
      this.isLoading = true;
      const { $apiFlip } = useNuxtApp(); 
      const { accessToken, user } = useAuth();

      try {
        const objectPerson: Record<string, any> = {};
        this.participants.forEach((p, index) => {
          objectPerson[`person${index + 1}`] = {
            Name: p.Name,           
            Gender: p.Gender.toLowerCase(),
            Age: Number(p.Age),
            Domicile: p.Domicile
          };
        });

        const payload = {
            Amount: String(this.finalAmount), 
            Name: user.value?.name || 'Guest',
            Bank: this.paymentMethod?.toLowerCase() || 'bsi', 
            EventSK: this.dauroh?.SK,
            objectPerson: objectPerson, 
            AccessToken: accessToken.value
        };

        if (this.voucherCode) {
            Object.assign(payload, { VoucherCode: this.voucherCode });
        }

        console.log("Payload Flip:", payload);

        const response = await $apiFlip.post('/flip-dauroh', payload);
        
        this.transactionDetails = response.data; 
        if (this.transactionDetails) {
            this.transactionDetails.paymentMethod = this.paymentMethod || 'Bank';
        }

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
      // Reset state ke default
      this.$reset();
    }
  },

  // 🔥 INI KUNCINYA!
  // @ts-ignore
  persist: true,
});