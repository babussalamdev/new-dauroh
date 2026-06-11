import { defineStore } from "pinia";
import { ref } from "vue";
import { useNuxtApp } from "#app"; 
import { useGlobalEventStore } from '~/stores/globalEvent';

export const useFinanceStore = defineStore("finance", () => {
  // State buat Summary
  const summary = ref({
    totalPendapatan: 0,
    totalTiketPrice: 0,
    totalInfaq: 0,
    totalTicketsSold: 0
  });
  const loadingSummary = ref(false);
  const lastFetchedEventSummary = ref('');

  // State buat Transactions
  const transactions = ref<any[]>([]);
  const loadingTx = ref(false);
  const lastFetchedEventTx = ref('');

  // Fetch Ringkasan Keuangan
  async function fetchSummary() {
    const globalStore = useGlobalEventStore();

    if (!globalStore.activeEventSK) {
      summary.value = { totalPendapatan: 0, totalTiketPrice: 0, totalInfaq: 0, totalTicketsSold: 0 };
      lastFetchedEventSummary.value = '';
      return;
    }

    // Cache check
    if (lastFetchedEventSummary.value === globalStore.activeEventSK) {
      return;
    }

    loadingSummary.value = true;
    const { $apiBase } = useNuxtApp();

    try {
      const res: any = await $apiBase.get(`/get-finance?type=summary&sk=${globalStore.activeEventSK}`);
      
      if (res && res.data) {
        summary.value = res.data;
      } else if (res) {
        summary.value = res;
      }
      lastFetchedEventSummary.value = globalStore.activeEventSK;
    } catch (error) {
      console.error("Gagal memuat ringkasan keuangan:", error);
      summary.value = { totalPendapatan: 0, totalTiketPrice: 0, totalInfaq: 0, totalTicketsSold: 0 };
    } finally {
      loadingSummary.value = false;
    }
  }

  // Fetch Daftar Transaksi
  async function fetchTransactions() {
    const globalStore = useGlobalEventStore();

    if (!globalStore.activeEventSK) {
      transactions.value = [];
      lastFetchedEventTx.value = '';
      return;
    }

    // Cache check
    if (lastFetchedEventTx.value === globalStore.activeEventSK && transactions.value.length > 0) {
      return;
    }

    loadingTx.value = true;
    const { $apiBase } = useNuxtApp();

    try {
      const res: any = await $apiBase.get(`/get-finance?type=transactions&sk=${globalStore.activeEventSK}`);
      if (res && res.data && res.data.transactions) {
        transactions.value = res.data.transactions;
      } else if (res && res.transactions) {
        transactions.value = res.transactions;
      } else {
        transactions.value = [];
      }
    } catch (error) {
      console.error("Gagal memuat daftar transaksi:", error);
      transactions.value = [];
    } finally {
      loadingTx.value = false;
    }
  }

  // Jalanin Keduanya Barengan
  async function fetchAllFinanceData() {
    // Pake Promise.all biar nembak API-nya paralel (barengan)
    await Promise.all([
      fetchSummary(),
      fetchTransactions()
    ]);
  }

  function resetStore() {
    summary.value = { totalPendapatan: 0, totalTiketPrice: 0, totalInfaq: 0, totalTicketsSold: 0 };
    transactions.value = [];
  }

  
  // RETURN 
  return {
    summary,
    transactions,
    loadingSummary,
    loadingTx,
    fetchSummary,
    fetchTransactions,
    fetchAllFinanceData,
    resetStore
  };
});