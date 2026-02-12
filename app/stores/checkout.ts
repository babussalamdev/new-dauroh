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
               
               let recoverData = recoverRes.data;
               
               // [REVISI] Unwrap Standard
               if (recoverData && recoverData.data) {
                   recoverData = recoverData.data;
               }

               // [REVISI] Unwrap Payment Object (CRITICAL FIX)
               // Ini ditambahin biar recovery ga error karena struktur nested
               if (recoverData && recoverData.Payment) {
                   console.log("📦 Unwrapping 'Payment' object for recovery...");
                   recoverData = recoverData.Payment;
               }

               if (recoverData) {
                 console.log("✅ Data berhasil dipulihkan!", recoverData);

                 let recoveredMethod = this.paymentMethod;
                 // Ambil method dari data server jika lokal kosong
                 if (!recoveredMethod && recoverData.sender_bank) {
                    recoveredMethod = recoverData.sender_bank.toUpperCase();
                 }
                 if (recoverData.sender_bank_type === 'wallet_account') {
                    recoveredMethod = 'QRIS';
                 }
                 
                 if (recoveredMethod) this.paymentMethod = recoveredMethod;

                 this.transactionDetails = {
                    ...recoverData,
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

    // [BARU] Action untuk memulihkan data transaksi Expired/Cancel buat Bayar Ulang
async restoreTransactionData(skEvent: string) {
      const { $apiFlip } = useNuxtApp();
  
      if (!skEvent) return false;
  
      try {
        this.isLoading = true;
        console.log("♻️ Restoring data for Event SK:", skEvent);
  
        const response = await $apiFlip.get('/get-flip-dauroh', {
            params: { skEvent: skEvent }
        });
  
        let data = response.data;
        
        // Unwrap logic
        if (data && data.data) data = data.data;
        if (data && data.Payment) data = data.Payment;
  
        if (!data) {
          console.error("❌ Gagal restore data: Response kosong.");
          return false;
        }
  
        console.log("📦 Data Restore Ditemukan:", data);

        // [REVISI MAPPING BIAR SESUAI JSON BARU]
        // 1. Coba ambil nama dari 'account_holder' kalau field nama lain kosong
        const fallbackName = data.receiver_bank_account?.account_holder || '';
        
        // 2. Coba ambil email dari 'SK' (karena di JSON SK-nya bentuk email)
        const fallbackEmail = (data.SK && data.SK.includes('@')) ? data.SK : '';

        // 3. Logic Peserta
        // Karena di JSON gak ada array 'participants', kita anggap ini single participant
        const participantsList: Participant[] = (data.participants || []).map((p: any) => ({
            Name: p.name || p.nama_peserta || p.Name || '',
            Email: p.email || '', 
            Gender: p.gender || p.jenis_kelamin || p.Gender || 'Ikhwan',
            Age: p.age || p.Age || 0,
            Domicile: p.domicile || p.Domicile || ''
        }));

        // Kalau list kosong, ambil data dari User Utama / Fallback tadi
        if (participantsList.length === 0) {
            participantsList.push({
                Name: data.user_name || data.customer_name || data.sender_name || fallbackName || '', // Pake fallbackName
                Email: data.user_email || data.sender_email || fallbackEmail || '', // Pake fallbackEmail
                Gender: 'Ikhwan', // Default karena di JSON gak ada info gender
                Age: 0,
                Domicile: '-'
            });
        }

        this.participants = participantsList;
  
        this.dauroh = {
          SK: data.PK || skEvent, // Note: Di JSON SK event itu ada di 'PK' ("event#369776") atau 'SK' user.
          Title: data.title || 'Event Dauroh',
          Price: data.amount ? (data.amount / (this.participants.length || 1)) : 0,
        };
  
        this.transactionDetails = null;
        this.removeVoucher();
        this.setStep('select'); 
  
        return true;
  
      } catch (error) {
        console.error("🔥 Error restoreTransactionData:", error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

async checkExistingTransaction(skEvent: string) {
      const { $apiFlip } = useNuxtApp();
      // Import Composable Status tadi
      const { getSmartStatus } = useTransactionStatus(); 
      
      if (!skEvent) return false;

      try {
        this.isLoading = true;
        
        const response = await $apiFlip.get('/get-flip-dauroh', {
            params: { skEvent: skEvent }
        });

        let result = response.data;

        // Unwrap logic standard
        if (result && result.data) result = result.data;
        if (result && result.Payment) result = result.Payment;

        let activeTransaction = null;

        // LOGIC PENCARIAN BARU (LEBIH PINTAR)
        if (Array.isArray(result)) {
            // Cari transaksi yang status PINTAR-nya adalah 'PENDING'
            activeTransaction = result.find((item: any) => {
               const smartStatus = getSmartStatus(item); // Pake fungsi manipulasi tadi
               return smartStatus === 'PENDING'; 
            });
        } else if (result && typeof result === 'object') {
            const smartStatus = getSmartStatus(result);
            if (smartStatus === 'PENDING') {
               activeTransaction = result;
            }
        }

        // Kalau ketemu transaksi yang beneran PENDING (Waktu belum abis)
        if (activeTransaction) {
           console.log("✅ Valid Pending Transaction Found!", activeTransaction);

           this.transactionDetails = {
              ...activeTransaction,
              vaNumber: activeTransaction.receiver_bank_account?.account_number || activeTransaction.va_number || '-',
              expiryTime: activeTransaction.expired_date || activeTransaction.expiry_date,
              paymentMethod: activeTransaction.sender_bank ? activeTransaction.sender_bank.toUpperCase() : 'BANK'
           };

           this.setStep('instructions');
           return true; // ARTINYA: ADA TAGIHAN, JANGAN KASIH DAFTAR BARU
        } else {
           // Kalau gak ada transaksi, ATAU ada transaksi tapi statusnya udah kita paksa jadi CANCELLED/EXPIRED
           console.log("ℹ️ No active transaction (All expired/cancelled). Allowed to register.");
           return false; // ARTINYA: AMAN, BOLEH DAFTAR BARU
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