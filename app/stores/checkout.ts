import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useNuxtApp } from "#app";
import { useAuth } from "~/composables/useAuth";
import { useEventStore } from "~/stores/event";
import type { Participant, EventInfo, TransactionDetails, CheckoutStep } from "~/types/participant";

export const useCheckoutStore = defineStore(
  "checkout",
  () => {
    // --- STATE ---
    const currentStep = ref<CheckoutStep>("select");
    const event = ref<EventInfo | null>(null);
    const participants = ref<Participant[]>([]);
    const paymentMethod = ref<string | null>(null);
    const transactionDetails = ref<TransactionDetails | null>(null);
    const voucherCode = ref<string | null>(null);
    const discountAmount = ref(0);
    const voucherApplied = ref(false);
    const isLoading = ref(false);
    const repay = ref<boolean>(false)
    const donationAmount = ref(0);

    // --- GETTERS (Computed) ---
    const totalAmount = computed(() => {
      if (!event.value || !participants.value) return 0;
      return (event.value.Price || 0) * participants.value.length;
    });
    const finalAmount = computed(() => {
      const total = (event.value?.Price || 0) * participants.value.length;
      const final = total - discountAmount.value + donationAmount.value;
      return final < 0 ? 0 : final;
    });

    const hasVoucher = computed(
      () => !!voucherCode.value && voucherApplied.value,
    );

    const step = computed(() => currentStep.value);
    const timeRemaining = computed(() => {
      if (!transactionDetails.value) return 0;
      let timeString = transactionDetails.value.expired_date;
      if (!timeString) return 0;
      if (typeof timeString === "string") {
        timeString = timeString.replace(" ", "T");
        if (!timeString.includes("+") && !timeString.endsWith("Z")) {
          timeString += "+07:00";
        }
      }
      const expireDate = new Date(timeString).getTime();
      const now = new Date().getTime();
      return isNaN(expireDate) ? 0 : expireDate - now;
    });

    const isExpired = computed(() => {
      const status = (transactionDetails.value?.status || "").toUpperCase();
      if (["EXPIRED", "CANCELLED", "FAILED"].includes(status)) return true;
      if (status === "PENDING") return timeRemaining.value <= -2000;
      return false;
    });

    const activeEventSK = computed(() => {
      const sk = transactionDetails.value?.event_sk || event.value?.SK || "";
      return sk.split("#")[0];
    });

    // --- ACTIONS (Functions) ---
    function setStep(step: CheckoutStep) {
      currentStep.value = step;
    }

    function startCheckout(registrationData: {
      event: EventInfo;
      participants: Participant[];
    }) {
      event.value = registrationData.event;
      participants.value = registrationData.participants;
      paymentMethod.value = null;
      transactionDetails.value = null;
      removeVoucher();
      donationAmount.value = 0;
      repay.value = false;
      currentStep.value = "select";
    }

    function setPaymentMethod(method: string) {
      paymentMethod.value = method;
    }

    function setVoucher(code: string, amount: number) {
      voucherCode.value = code;
      discountAmount.value = amount;
      voucherApplied.value = true;
    }

    function removeVoucher() {
      voucherCode.value = null;
      discountAmount.value = 0;
      voucherApplied.value = false;
    }

    function resetTransaction() {
      transactionDetails.value = null;
      paymentMethod.value = null;
    }

    async function createPayment() {
      isLoading.value = true;
      const { $apiFlip } = useNuxtApp();
      const { accessToken, user } = useAuth();

      try {
        const rawSK = [
          transactionDetails.value?.event_sk,
          transactionDetails.value?.event?.SK,
          transactionDetails.value?.Subject,
          event.value?.SK,
          event.value?.id,
        ].find((s) => s && typeof s === "string" && !s.includes("@"));

        if (!rawSK)
          throw new Error(
            "Data Event (SK) tidak ditemukan. Silakan ulangi dari awal.",
          );
        const eventSK = repay.value === true ? rawSK : (rawSK as string).split("#")[0];
        const objectPerson: Record<string, any> = {};
        participants.value.forEach((p, index) => {
          objectPerson[`person${index + 1}`] = {
            PK: p.PK,
            SK: p.SK,
            Name: p.Name,
            Gender: p.Gender?.toLowerCase() || "-",
            Age: Number(p.Age),
            Domicile: p.Domicile || "-",
          };
        });
        let bankCode = (paymentMethod.value || "bsm").toLowerCase();
        if (bankCode === "bsi") bankCode = "bsm";

        let paymentType = "virtual_account";
        if (["qris", "gopay", "shopeepay"].includes(bankCode)) {
          bankCode = "qris";
          paymentType = "wallet_account";
        }


        const pureTicketPrice = ((event.value?.Price || 0) * participants.value.length) - discountAmount.value;
        const validAmountToSend = pureTicketPrice > 0 ? pureTicketPrice : 0;
        const payload: any = {
          Amount: String(validAmountToSend),
          Name: user.value?.name || "Guest",
          Bank: bankCode,
          EventSK: eventSK,
          objectPerson: objectPerson,
          AccessToken: accessToken.value,
          PaymentType: paymentType,
          sender_bank_type: paymentType,
          repay: repay.value,
          Infaq: donationAmount.value ? String(donationAmount.value) : "0",
          Voucher: voucherCode.value || "",
          ...(voucherCode.value && { VoucherCode: voucherCode.value }),
        };

        const response = await $apiFlip.post("/flip-dauroh", payload, {
          headers: { Authorization: `Bearer ${accessToken.value}` },
        });

        const result = response.data;
        transactionDetails.value = {
          ...result,
          vaNumber: result.receiver_bank_account?.account_number || result.va_number,
         expired_date: result.expired_date,
         expiryTime: result.expired_date,
         amount: result.amount,
         paymentMethod: paymentMethod.value || "Bank",
        };

        const status = (result.status || "").toUpperCase();
        if (status === 'SUCCESSFUL') {
          currentStep.value = "success"; 
        } else {
          currentStep.value = "instructions";
        }
        return { success: true, data: result };
      } finally {
        isLoading.value = false;
      }
    }
    
  async function restoreTransactionData(skTransaction: string) {
      const { $apiBase } = useNuxtApp();
      const eventStore = useEventStore();

      if (!skTransaction || !skTransaction.includes("#")) return false;

      try {
        isLoading.value = true;
        const response = await $apiBase.get("/get-payment", {
          params: { type: "payment-detail", sk: skTransaction },
        });

        // 🟢 TANGKAP RESPONSE JSON
        const data = response.data?.data || response.data;
        if (!data || !data.Participant) return false;

        const fullEventSK = data.SK || data.Participant[0]?.PK || skTransaction;

        // DATA PESERTA
        participants.value = data.Participant.map((p: any) => ({
          PK: p.PK,
          SK: p.SK,
          Name: p.Name,
          Gender: p.Gender,
          Age: p.Age,
          Domicile: p.Domicile,
        }));
        
        // INFAQ
        donationAmount.value = Number(data.Infaq || data.infaq || 0);
        
        // Cek kalau transaksi sebelumnya pakai voucher, balikin datanya!
        if (data.VoucherCode || data.Voucher) {
            voucherCode.value = data.VoucherCode || data.Voucher || "";
            discountAmount.value = Number(data.Discount || data.discount || 0); 
            voucherApplied.value = true;
        } else {
            removeVoucher();
        }

        let realPrice = 0;
        const totalAmountFromBE = Number(data.Amount || data.amount || 0);
        const pureTicketTotal = totalAmountFromBE + discountAmount.value; 
        
        realPrice = participants.value.length > 0 ? pureTicketTotal / participants.value.length : 0;

        // 🟢 SET DATA EVENT KE STORE
        event.value = {
          SK: fullEventSK, // 👈 SEKARANG UDAH FULL TERKIRIM (3a89f9#b5ab2e)
          Title: data.Title || data.title || "Nama Event Tidak Tersedia",
          Place: "Lokasi Tidak Tersedia",
          Price: realPrice < 0 ? 0 : realPrice,
          Picture: data.Picture || data.event?.Picture || data.event?.picture || "",
        };
        
        repay.value = true;
        setStep("select"); // Langsung masuk ke "Pilih Bank"
        return true;
      } catch (error) {
        console.error("Gagal Restore Data:", error)
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    function noRepay() {
      repay.value = false
    }

    async function checkExistingTransaction(skEvent: string) {
      const { $apiFlip } = useNuxtApp();
      try {
        const skHash = skEvent.split('#')[0]
        const response = await $apiFlip.get("/get-flip-dauroh", {
          params: { skEvent: skHash },
        });
        const paymentData = response.data?.Payment;
        
        if (paymentData) {
          transactionDetails.value = {
            ...paymentData,
            paymentMethod: (
              paymentData.sender_bank ||
              paymentData.bank_code ||
              "bsm"
            ).toLowerCase(),
            vaNumber:
              paymentData.receiver_bank_account?.account_number ||
              paymentData.va_number,
            expiryTime: paymentData.expired_date || paymentData.expiry_date,
            amount: paymentData.amount,
            event_sk: skEvent, 
            Subject: skEvent, 
          };
          
          setStep("instructions");
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }

    function updatePaymentStatus(payload: any) {
      if (transactionDetails.value) {
        transactionDetails.value = {
          ...transactionDetails.value,
          ...payload,
          status: payload.status || transactionDetails.value.status,
        };
      } else {
        transactionDetails.value = payload;
      }
    }

    function clearCheckout() {
      currentStep.value = "select";
      event.value = null;
      participants.value = [];
      paymentMethod.value = null;
      transactionDetails.value = null;
      voucherCode.value = null;
      discountAmount.value = 0;
      voucherApplied.value = false;
      isLoading.value = false;
      donationAmount.value = 0;
      repay.value = false;
    }

    return {
      // State
      currentStep,
      event,
      participants,
      paymentMethod,
      transactionDetails,
      voucherCode,
      discountAmount,
      voucherApplied,
      isLoading,
      repay,
      donationAmount,
      // Getters
      totalAmount,
      finalAmount,
      hasVoucher,
      step,
      timeRemaining,
      isExpired,
      activeEventSK,
      // Actions
      setStep,
      startCheckout,
      setPaymentMethod,
      setVoucher,
      removeVoucher,
      resetTransaction,
      createPayment,
      restoreTransactionData,
      checkExistingTransaction,
      updatePaymentStatus,
      clearCheckout,
      noRepay
    };
  },
  {
    persist: true,
  },
);
