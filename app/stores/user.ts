import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useStorage } from "@vueuse/core";
import { useEventStore } from "~/stores/event";
// import { useCheckoutStore } from "./checkout";
import { useToastStore } from "./toast";
// import { useAuth } from "~/composables/useAuth";
import type { Participant, UserTicket } from "~/types/user";

export const useUserStore = defineStore("user", () => {
  // --- STATE ---
  const tickets = useStorage<UserTicket[]>("user_tickets_v2", []);
  // const user = ref<UserProfile | null>(null);
  const isLoading = ref(false);

  // --- GETTERS (Computed) ---
  const transactions = computed(() => tickets.value);
  const getAllTickets = computed(() => tickets.value);

  const getUpcomingTickets = computed(() =>
    tickets.value.filter(
      (t) => t.status === "Upcoming" || t.status === "SUCCESSFUL",
    ),
  );

  const getPendingTickets = computed(() =>
    tickets.value.filter((t) => t.status === "PENDING"),
  );

  const getDashboardData = computed(() => {
    return [...tickets.value]
      .filter((t) =>
        ["PENDING", "SUCCESSFUL", "Upcoming", "active", "CHECKED_IN"].includes(
          t.status,
        ),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // --- ACTIONS (Functions) ---

  /**
   * Fungsi Reset State (WAJIB untuk Setup Store agar useAuth tidak error)
   */
  function $reset() {
    tickets.value = [];
    // user.value = null;
    isLoading.value = false;
    console.log("♻️ User Store has been reset");
  }

  async function fetchUserTransactions() {
    const { $apiBase } = useNuxtApp();
    if (!$apiBase) return;

    const eventStore = useEventStore();
    // const { user: authUser } = useAuth();

    isLoading.value = true;

    try {
      const response = await $apiBase.get("/get-payment?type=client");
      let rawData = response.data?.data || response.data;

      if (!Array.isArray(rawData)) {
        tickets.value = [];
        return;
      }

      const mappedTickets = rawData.map((item: any) => {
        return {
          SK: item.SK,
          status: item.Status || "PENDING",
          created_at: item.CreatedAt,
          date: item.CreatedAt,
          amount: item.Amount,
          participants: item.Participant,
          title: item.Title,
          Expired_Date: item.Expired_Date || item.expired_date || "-",
        } as UserTicket;
      });

      tickets.value = mappedTickets.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      );
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function registerEvent(payload: any) {
    const { event, participants, transactionDetails } = payload;
    const eventStore = useEventStore();

    let initialStatus: UserTicket["status"] = "Upcoming";
    let trxAmount = 0;

    if (transactionDetails) {
      initialStatus =
        transactionDetails.status === "PENDING" ? "PENDING" : "Upcoming";
      trxAmount = Number(transactionDetails.amount || 0);
    }

    const finalId = transactionDetails?.link_id
      ? String(transactionDetails.link_id)
      : String(Date.now());

    const newTicket: UserTicket = {
      SK: finalId,
      id: finalId,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      title: event?.Title || "Event Event",
      event: event,
      participants: participants || [],
      total_participants: participants?.length || 0,
      status: initialStatus,
      amount: trxAmount || (event?.Price || 0) * (participants?.length || 1),
      va_number:
        transactionDetails?.vaNumber ||
        transactionDetails?.receiver_bank_account?.account_number,
      receiver_bank_account: transactionDetails?.receiver_bank_account,
      sender_bank:
        transactionDetails?.sender_bank || transactionDetails?.paymentMethod,
      expired_date:
        transactionDetails?.expiryTime || transactionDetails?.expired_date,
    };

    const exists = tickets.value.find((t) => t.SK === newTicket.SK);
    if (!exists) {
      tickets.value.unshift(newTicket);
    } else {
      Object.assign(exists, newTicket);
    }

    if (event?.SK && initialStatus !== "PENDING") {
      const total = participants.length;
      const ikhwan = participants.filter(
        (p: any) => p.Gender?.toLowerCase() === "ikhwan",
      ).length;
      const akhwat = participants.filter(
        (p: any) => p.Gender?.toLowerCase() === "akhwat",
      ).length;

      if (typeof (eventStore as any).decrementQuota === "function") {
        (eventStore as any).decrementQuota(event.SK, total, ikhwan, akhwat);
      }
    }
  }

  function removeTicket(skOrId: string) {
    if (!skOrId) return;
    tickets.value = tickets.value.filter(
      (t) => t.SK !== skOrId && t.id !== skOrId,
    );

    const toastStore = useToastStore();
    toastStore.showToast({
      message: "Riwayat berhasil dihapus.",
      type: "success",
    });
  }

  // function statusPayment(data: any) {
  //   const storeCheckout = useCheckoutStore();
  //   storeCheckout.setStep("success");
  // }

  return {
    // State
    tickets,
    // user,
    isLoading,
    // Getters
    transactions,
    getAllTickets,
    getUpcomingTickets,
    getPendingTickets,
    getDashboardData,
    // Actions
    $reset,
    fetchUserTransactions,
    registerEvent,
    removeTicket
    // statusPayment,
  };
});
