import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useNuxtApp } from '#app';
import type { AttendanceParticipant } from '~/types/attendance';
import type { Event } from '~/types/event';

export const useAttendanceStore = defineStore('attendance', () => {

  // --- STATE ---
  const events = ref<Event[]>([]); 
  const selectedEventSK = ref(""); 
  const participants = ref<AttendanceParticipant[]>([]); 
  const loading = ref(false);

  // --- ACTIONS ---
  async function fetchEvents() {
    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get('/get-default?type=event');
      const data = res.data?.event || res.data;
      events.value = Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Gagal fetch events:", error);
    }
  }
  async function fetchAttendanceData(statusType: 'present' | 'not-present' = 'present') {
    if (!selectedEventSK.value) return; 
    
    loading.value = true;
    participants.value = [];

    try {
      const { $apiBase } = useNuxtApp() as any;
      const res = await $apiBase.get('/get-attendance', {
        params: {
          type: statusType,
          sk: selectedEventSK.value
        }
      });

      const rawData = res.data || [];
      participants.value = rawData.map((p: any) => ({
        pk: p.PK, 
        name: p.Name,
        ticketId: p.SK, 
        gender: p.Gender?.toLowerCase() === 'akhwat' ? 'p' : 'l', 
        age: p.Age,
        scanTime: p.CheckIn || null, 
        status: statusType === 'present' ? 'hadir' : 'belum'
      }));

    } catch (error) {
      console.error("Gagal ambil data kehadiran:", error);
    } finally {
      loading.value = false;
    }
  }

  return {
    events,
    selectedEventSK,
    participants,
    loading,
    fetchEvents,
    fetchAttendanceData
  };
});