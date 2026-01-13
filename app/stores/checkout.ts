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

// Interface Response Transaksi (Sesuai Response Flip)
interface TransactionDetails {
  link_id?: string;
  link_url?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  vaNumber?: string;       // Mapping dari receiver_bank_account.account_number
  expiryTime?: string;     // Mapping dari expired_date
  expired_date?: string;   // Field asli Flip
  sender_bank_type?: string; 
  [key: string]: any;
}

export const useCheckoutStore = defineStore('checkout', {
  // --- STATE ---
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
        // 1. Siapkan Object Peserta (Sesuai Payload JSON: person1, person2, dst)
        const objectPerson: Record<string, any> = {};
        this.participants.forEach((p, index) => {
          objectPerson[`person${index + 1}`] = {
            Name: p.Name,           
            Gender: p.Gender.toLowerCase(), // "akhwat" / "ikhwan"
            Age: Number(p.Age),
            Domicile: p.Domicile
          };
        });

        // 2. Tentukan Bank (Sesuai Payload JSON: "Bank")
        let bankCode = this.paymentMethod?.toLowerCase() || 'bsi';
        let paymentType = 'virtual_account'; // Default

        // Logic QRIS (Jika backend nanti support)
        if (bankCode === 'qris' || bankCode === 'gopay') {
            bankCode = 'qris'; 
            paymentType = 'wallet_account'; 
        }

        // 3. Susun Payload (STRUKTUR SAMA PERSIS DENGAN CONTOH KAMU)
        const payload: any = {
            Amount: String(this.finalAmount), // String "200000"
            Name: user.value?.name || 'Guest',
            
            Bank: bankCode, // String "mandiri", "bni", dll.
            EventSK: this.dauroh?.SK,
            
            objectPerson: objectPerson, 
            AccessToken: accessToken.value,

            // --- Parameter Tambahan (Opsional / Jaga-jaga) ---
            // Dikirim siapa tahu backend membacanya untuk QRIS
            PaymentType: paymentType, 
            sender_bank_type: paymentType 
        };

        if (this.voucherCode) {
            payload.VoucherCode = this.voucherCode;
        }

        console.log("Payload Flip:", payload);

        // 4. Kirim Request
        const response = await $apiFlip.post('/flip-dauroh', payload);
        const result = response.data; 
        
        // 5. Mapping Response agar Frontend (Instructions.vue) bisa baca
        this.transactionDetails = {
            ...result, 
            
            // Ambil Nomor VA yang ngumpet di dalam object receiver_bank_account
            vaNumber: result.receiver_bank_account?.account_number, 
            
            // Mapping waktu expire untuk countdown
            expiryTime: result.expired_date,

            // Simpan metode pembayaran biar logonya muncul
            paymentMethod: this.paymentMethod || 'Bank'
        };

        return { success: true, data: result };

      } catch (error: any) {
        console.error("Payment Flip Error:", error);
        
        let errorMessage = "Terjadi kesalahan saat memproses pembayaran.";
        // Handle error message dari backend/Flip dengan rapi
        if (error.response && error.response.data) {
           // Cek apakah error string atau object
           const errData = error.response.data;
           if (typeof errData === 'string') {
             errorMessage = errData;
           } else {
             errorMessage = errData.message || errData.error || JSON.stringify(errData);
           }
        }

        return { success: false, message: errorMessage, error: error };
      } finally {
        this.isLoading = false;
      }
    },

    // --- Action untuk WebSocket ---
    updatePaymentStatus(data: any) {
      console.log("Store Update Received:", data);
      if (this.transactionDetails) {
        this.transactionDetails = { ...this.transactionDetails, ...data };
      } else {
        this.transactionDetails = data;
      }
    },

    setExpired() {
      if (this.transactionDetails) {
        this.transactionDetails.status = 'expired';
      }
    },

    clearCheckout() {
      this.$reset();
    }
  },

  // @ts-ignore
  persist: true,
});