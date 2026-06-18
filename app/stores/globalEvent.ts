import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useGlobalEventStore = defineStore('globalEvent', () => {
  // --- STATE ---
  const selectedYear = ref<number>(new Date().getFullYear());
  const selectedMonth = ref<number>(new Date().getMonth() + 1);
  
  // Nyimpen Event yang lagi dikelola
  const activeEvent = ref<{ SK: string, Title: string, Date?: any } | null>(null);

  // --- GETTERS ---
  const activeEventSK = computed(() => activeEvent.value?.SK || '');
  const hasActiveEvent = computed(() => !!activeEvent.value);
  
  // Ambil list hari dari Date event (format backend biasanya { "1": { date: "..." }, "2": { date: "..." } })
  const activeEventDays = computed(() => {
    if (!activeEvent.value) return [];
    if (!activeEvent.value.Date) return ['1'];
    
    // Kalau Date berupa object (seperti yang sering dikembalikan BE)
    if (typeof activeEvent.value.Date === 'object') {
      const keys = Object.keys(activeEvent.value.Date);
      if (keys.length === 0) return ['1'];
      return keys.sort((a, b) => Number(a) - Number(b));
    }
    
    // Fallback kalau cuma 1 hari atau belum diatur
    return ['1'];
  });

  // --- ACTIONS ---
  function setYearMonth(year: number, month: number) {
    selectedYear.value = year;
    selectedMonth.value = month;
  }

  function setActiveEvent(sk: string, title: string, eventDate?: any) {
    activeEvent.value = { SK: sk, Title: title, Date: eventDate };
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
    activeEventDays,
    setYearMonth,
    setActiveEvent,
    clearActiveEvent,
    resetStore
  };
}, {

  persist: true 
});