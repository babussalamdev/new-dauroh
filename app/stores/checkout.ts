import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';
import { useAuth } from '~/composables/useAuth';

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
        const objectPerson: Record<string, any> = {};
        this.participants.forEach((p, index) => {
          objectPerson[`person${index + 1}`] = {
            Name: p.Name,           
            Gender: p.Gender.toLowerCase(),
            Age: Number(p.Age),
            Domicile: p.Domicile
          };
        });

        let bankCode = this.paymentMethod?.toLowerCase() || 'bsi';
        let paymentType = 'virtual_account'; 

        if (bankCode === 'qris' || bankCode === 'gopay') {
            bankCode = 'qris'; 
            paymentType = 'wallet_account'; 
        }
        const payload: any = {
            Amount: String(this.finalAmount),
            Name: user.value?.name || 'Guest',
            Bank: bankCode, 
            EventSK: this.dauroh?.SK,
            objectPerson: objectPerson, 
            AccessToken: accessToken.value,
            PaymentType: paymentType, 
            sender_bank_type: paymentType 
        };

        if (this.voucherCode) {
            payload.VoucherCode = this.voucherCode;
        }
       
        const response = await $apiFlip.post('/flip-dauroh', payload);
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
        console.error("Payment Flip Error:", error);
        
        const errData = error.response?.data || {};
        const errMsg = (errData.error || errData.message || '').toUpperCase();

        if (errMsg.includes('PENDING') || errMsg.includes('MEMILIKI BOOKING')) {
           try {
             const skEvent = this.dauroh?.SK; 
             if (skEvent) {
               console.log("⚠️ Booking Pending terdeteksi. Recovering...");
               
               const recoverRes = await $apiFlip.get(`/get-flip-dauroh?skEvent=${skEvent}`);
               
               // [FIX 1] Pastikan kita ambil object data yang benar
               // Kadang response dibungkus { data: { ... } }, kadang langsung { ... }
               let recoverData = recoverRes.data;
               if (recoverData && recoverData.data) {
                   recoverData = recoverData.data;
               }

               if (recoverData) {
                 console.log("✅ Data berhasil dipulihkan!", recoverData);

                 // [FIX 2] Auto-Detect Payment Method dari JSON ('sender_bank': 'bni')
                 // Kalau this.paymentMethod kosong, kita ambil dari 'sender_bank'
                 let recoveredMethod = this.paymentMethod;
                 if (!recoveredMethod && recoverData.sender_bank) {
                    recoveredMethod = recoverData.sender_bank.toUpperCase();
                 }
                 // Handle kasus QRIS/Wallet
                 if (recoverData.sender_bank_type === 'wallet_account') {
                    recoveredMethod = 'QRIS';
                 }
                 
                 // Simpan ke state biar UI select bank juga sync (opsional)
                 if (recoveredMethod) this.paymentMethod = recoveredMethod;

                 this.transactionDetails = {
                    ...recoverData,
                    // [FIX 3] Mapping VA Number yang lebih robust
                    vaNumber: recoverData.receiver_bank_account?.account_number || recoverData.va_number, 
                    expiryTime: recoverData.expired_date,
                    paymentMethod: recoveredMethod || 'Bank'
                 };
                 this.currentStep = 'instructions';
                 
                 return { success: true, recovered: true, data: recoverData };
               }
             }
           } catch (recoverErr) {
             console.error("❌ Gagal recover:", recoverErr);
           }
        }

        let errorMessage = "Terjadi kesalahan saat memproses pembayaran.";
        if (typeof errData === 'object' && errData.error) {
           errorMessage = errData.error;
        } else if (errData.message) {
           errorMessage = errData.message;
        } else if (typeof errData === 'string') {
           errorMessage = errData;
        }

        return { success: false, message: errorMessage, error: error };
      } finally {
        this.isLoading = false;
      }
    },
async checkExistingTransaction(skEvent: string) {
    const { $apiFlip } = useNuxtApp();
    
    if (!skEvent) return false;

    try {
      this.isLoading = true;
      console.log("🔍 Checking transaction for Event SK:", skEvent); 

      const response = await $apiFlip.get('/get-flip-dauroh', {
          params: { skEvent: skEvent }
      });

      console.log("📥 API Response:", response.data);

      let result = response.data;

      // 1. Unwrap standard (jika dibungkus 'data')
      if (result && result.data) result = result.data;

      // [FIX BARU] 2. Unwrap khusus structure API lu (Ada key 'Payment')
      // Kalau di dalem result ada key 'Payment', berarti itu data utamanya.
      if (result && result.Payment) {
          console.log("📦 Unwrapping 'Payment' object...");
          result = result.Payment;
      }

      let pendingTx = null;

      // 3. Logic pencarian (Sama kayak sebelumnya)
      if (Array.isArray(result)) {
          pendingTx = result.find((item: any) => 
             (item.status || item.Status || '').toUpperCase() === 'PENDING'
          );
      } else if (result && typeof result === 'object') {
          const status = (result.status || result.Status || '').toUpperCase();
          if (status === 'PENDING') {
             pendingTx = result;
          }
      }

      // 4. Eksekusi
      if (pendingTx) {
         console.log("✅ PENDING Transaction Found!", pendingTx);

         this.transactionDetails = {
            ...pendingTx,
            // Mapping VA Number (Sesuai response lu: receiver_bank_account.account_number)
            vaNumber: pendingTx.receiver_bank_account?.account_number || pendingTx.va_number || '-',
            // Mapping Expired (Sesuai response lu: expired_date)
            expiryTime: pendingTx.expired_date || pendingTx.expiry_date,
            // Mapping Bank (Sesuai response lu: sender_bank)
            paymentMethod: pendingTx.sender_bank ? pendingTx.sender_bank.toUpperCase() : 'BANK'
         };

         this.setStep('instructions');
         return true;
      } else {
         console.warn("⚠️ Transaction not found or not PENDING.");
         return false;
      }

    } catch (error) {
      console.error("🔥 Error checkExistingTransaction:", error);
      return false;
    } finally {
      this.isLoading = false;
    }
  },
    
    updatePaymentStatus(data: any) {
      if (this.transactionDetails) {
        this.transactionDetails = { ...this.transactionDetails, ...data };
      } else {
        this.transactionDetails = data;
      }
    },
    setExpired() {
      // No-op (Handled by UI)
    },

    clearCheckout() {
      this.$reset();
      this.currentStep = 'select';
    }
  },

  // @ts-ignore
  persist: true,
});