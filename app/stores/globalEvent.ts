import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useGlobalEventStore = defineStore('globalEvent', () => {
  // --- STATE ---
  const selectedYear = ref<number>(new Date().getFullYear());
  const selectedMonth = ref<number>(new Date().getMonth() + 1);
  
  // Nyimpen Event yang lagi dikelola
  const activeEvent = ref<{ SK: string, Title: string } | null>(null);

  // --- GETTERS ---
  const activeEventSK = computed(() => activeEvent.value?.SK || '');
  const hasActiveEvent = computed(() => !!activeEvent.value);

  // --- ACTIONS ---
  function setYearMonth(year: number, month: number) {
    selectedYear.value = year;
    selectedMonth.value = month;
  }

  function setActiveEvent(sk: string, title: string) {
    activeEvent.value = { SK: sk, Title: title };
  }

  function clearActiveEvent() {
    activeEvent.value = null;
  }

  function resetStore() {
    selectedYear.value = new Date().getFullYear();
    selectedMonth.value = new Date().getMonth() + 1;
    activeEvent.value = null;
  }

  return {
    selectedYear,
    selectedMonth,
    activeEvent,
    activeEventSK,
    hasActiveEvent,
    setYearMonth,
    setActiveEvent,
    clearActiveEvent,
    resetStore
  };
}, {

  persist: true 
});