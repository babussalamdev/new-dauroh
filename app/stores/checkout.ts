import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import { useAuth } from '~/composables/useAuth';
import { useDaurohStore } from '~/stores/dauroh';

export type CheckoutStep = 'select' | 'summary' | 'instructions';

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
  expired_date?: string;
  sender_bank_type?: string; 
  [key: string]: any;
}


export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    currentStep: 'select' as CheckoutStep,
    dauroh: null as Dauroh | null,
    participants: [] as Participant[],
    paymentMethod: null as string | null,
    transactionDetails: null as TransactionDetails | null, 
    
    voucherCode: null as string | null,
    discountAmount: 0,
    voucherApplied: false,
    
    isLoading: false,
  }),

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
    },

    step(state): CheckoutStep {
       return state.currentStep;
    },

    timeRemaining(state): number {
      if (!state.transactionDetails?.expiryTime) return 0;
      
      let timeString = state.transactionDetails.expiryTime;
      
      if (typeof timeString === 'string') {
          timeString = timeString.replace(' ', 'T');
          if (!timeString.includes('+') && !timeString.endsWith('Z')) {
              timeString += '+07:00'; // FORCE WIB
          }
      }

      const expireDate = new Date(timeString).getTime();
      const now = new Date().getTime();
      
      if (isNaN(expireDate)) return 0;

      return expireDate - now;
    },

    isExpired(): boolean {
      const status = (this.transactionDetails?.status || '').toUpperCase();
      
      if (status === 'EXPIRED' || status === 'CANCELLED' || status === 'FAILED') return true;
      
      if (status === 'PENDING') {
         return this.timeRemaining <= -2000;
      }

      return false;
    }
  },

  actions: {
    setStep(step: CheckoutStep) {
      this.currentStep = step;
    },

    startCheckout(registrationData: { dauroh: Dauroh; participants: Participant[] }) {
      this.dauroh = registrationData.dauroh;
      this.participants = registrationData.participants;
      this.paymentMethod = null;
      this.transactionDetails = null;
      this.removeVoucher(); 
      this.currentStep = 'select';
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

    resetTransaction() {
      this.transactionDetails = null;
      this.paymentMethod = null;
    },

  async createPayment() {
    this.isLoading = true;
    const { $apiFlip } = useNuxtApp();
    const { accessToken, user } = useAuth();

    try {
        const rawSK = [
            this.transactionDetails?.event_sk,
            this.transactionDetails?.dauroh?.SK,
            this.transactionDetails?.Subject,
            this.dauroh?.SK,
            this.dauroh?.id
        ].find(s => s && typeof s === 'string' && !s.includes('@'));
        if (!rawSK) {
            throw new Error("Data Event (SK) tidak ditemukan. Silakan ulangi dari awal.");
        }
        const eventSK = (rawSK as string).split('#')[0];
        if (!eventSK) throw new Error("ID Event tidak valid.");

        console.log("💳 Create Payment Event ID (Clean):", eventSK);

        const objectPerson: Record<string, any> = {};
        this.participants.forEach((p, index) => {
            objectPerson[`person${index + 1}`] = {
                Name: p.Name,
                Gender: p.Gender?.toLowerCase() || '-',
                Age: Number(p.Age),
                Domicile: p.Domicile || '-'
            };
        });

        let bankCode = (this.paymentMethod || 'bsm').toLowerCase();
        if (bankCode === 'bsi') bankCode = 'bsm';

        let paymentType = 'virtual_account';
        if (['qris', 'gopay', 'shopeepay'].includes(bankCode)) {
            bankCode = 'qris';
            paymentType = 'wallet_account';
        }

        const payload: any = {
            Amount: String(this.finalAmount),
            Name: user.value?.name || 'Guest',
            Bank: bankCode,
            EventSK: eventSK,
            objectPerson: objectPerson,
            AccessToken: accessToken.value,
            PaymentType: paymentType,
            sender_bank_type: paymentType
        };

        if (this.voucherCode) {
            payload.VoucherCode = this.voucherCode;
        }

        const config = {
            headers: { Authorization: `Bearer ${accessToken.value}` }
        };

        const response = await $apiFlip.post('/flip-dauroh', payload, config);
        const result = response.data;

        this.transactionDetails = {
            ...result,
            vaNumber: result.receiver_bank_account?.account_number,
            expiryTime: result.expired_date,
            paymentMethod: this.paymentMethod || 'Bank'
        };
        this.currentStep = 'instructions';

        return { success: true, data: result };

    } catch (error: any) {
        console.error("❌ Payment Error:", error);
        const errData = error.response?.data || {};
        let errorMessage = errData.error || errData.message || "Terjadi kesalahan saat memproses pembayaran.";
        if (typeof errorMessage !== 'string') errorMessage = JSON.stringify(errorMessage);

        return { success: false, message: errorMessage, error: error };
    } finally {
        this.isLoading = false;
    }
},

async restoreTransactionData(skTransaction: string) {
        const { $apiBase } = useNuxtApp();
        const daurohStore = useDaurohStore(); 
        
        console.log("♻️ Restore SK:", skTransaction);

        if (!skTransaction || !skTransaction.includes('#')) {
           return false;
        }

        try {
          this.isLoading = true;

          // 1. Tembak API
          const response = await $apiBase.get('/get-payment', {
            params: { 
                type: 'payment-detail', // Sesuai instruksi
                sk: skTransaction 
            }
          });

          // Ambil raw data
          let data = response.data?.data || response.data;

          // Validasi Data Peserta (Sesuai JSON: key-nya "Participant")
          if (!data || !data.Participant || data.Participant.length === 0) {
             return false;
          }

          // 2. AMBIL HARGA DARI MASTER DATA (Pake "Subject")
          // Karena JSON lu ga ada harga, kita cari event pake ID dari "Subject"
          const eventId = data.Subject; // Isinya "c923b0"
          
          // Pastikan store dauroh ke-load
          if (daurohStore.tiketDauroh.length === 0) {
              await daurohStore.fetchPublicTiketDauroh();
          }

          // Cari Event-nya di master
          const foundEvent = daurohStore.tiketDauroh.find((d: any) => d.SK === eventId);
          
          // Ambil Harga Asli dari Master Event
          const realPrice = foundEvent ? Number(foundEvent.Price) : 0;

          // 3. MASUKIN DATA KE STATE (Mapping Sesuai JSON)
          this.participants = data.Participant.map((p: any) => ({
              Name: p.Name,       // Sesuai JSON
              Gender: p.Gender,   // Sesuai JSON
              Age: p.Age,         // Sesuai JSON
              Domicile: p.Domicile // Sesuai JSON
          }));

          // 4. SET INFO DAUROH (Gabungan Data JSON + Master Price)
          this.dauroh = {
              SK: data.Subject,        // "c923b0"
              Title: foundEvent?.Title || 'Event Dauroh', // Judul dari Master
              Place: foundEvent?.Place || 'Lokasi Online',
              Price: realPrice         // 👈 INI KUNCINYA (Harga 250.000 masuk sini)
          };

          // Pindah ke halaman pilih metode
          this.setStep('select');
          return true;

        } catch (error) {
          console.error("🔥 Error Restore:", error);
          return false;
        } finally {
          this.isLoading = false;
        }
    },

 async checkExistingTransaction(skEvent: string) {
    const { $apiFlip } = useNuxtApp();
    
    try {
        const response = await $apiFlip.get('/get-flip-dauroh', {
            params: { skEvent: skEvent }
        });

        const result = response.data;
        const paymentData = result?.Payment;

        if (paymentData) {
            this.transactionDetails = {
                ...paymentData,
                paymentMethod: (paymentData.sender_bank || paymentData.bank_code || 'bsm').toLowerCase(),
                vaNumber: paymentData.receiver_bank_account?.account_number || paymentData.va_number,
                expiryTime: paymentData.expired_date || paymentData.expiry_date,
                amount: paymentData.amount || paymentData.bill_amount
            };
            this.setStep('instructions');
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error check transaction:", error);
        return false;
    }
},
    
   updatePaymentStatus(payload: any) {
        if (this.transactionDetails) {
            console.log("⚡ WebSocket Update Received:", payload.status);
            this.transactionDetails = { 
                ...this.transactionDetails, 
                ...payload,
                status: payload.status || this.transactionDetails.status 
            };
        } else {
            this.transactionDetails = payload;
        }
    },

    setExpired() { },

    clearCheckout() {
        this.$reset();
        this.currentStep = 'select';
    }
  },

  persist: true,
});