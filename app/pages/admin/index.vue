<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h3 class="fw-bold mb-1 text-dark">Ahlan wa Sahlan, {{ user?.name || 'Admin' }}! 👋</h3>
          <p class="text-muted mb-0 small">
            Dashboard manajemen sistem <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 ms-1">{{ userRoleLabel }}</span>
          </p>
        </div>
        <div class="text-md-end" style="min-width: 250px;">
          <select class="form-select border-success fw-medium shadow-sm rounded-pill px-4" 
            v-model="selectedEventSK" @change="fetchEventDashboardData" :disabled="isLoadingEvents">
            <option value="" disabled>{{ isLoadingEvents ? 'Memuat Event...' : '-- Pilih Event Aktif --' }}</option>
            <option v-for="event in activeEvents" :key="event.SK" :value="event.SK">{{ event.Title.toUpperCase() }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="selectedEventSK" class="animate-fade-in mb-5">
      <CommonLoadingSpinner v-if="isLoadingEventData" class="my-4" />
      <div v-else>
        <AdminDashboardEventStats :stats="eventStats" />
        
        <AdminDashboardAttendanceRatio :stats="eventStats" :genderType="selectedEventGender" />
      </div>
    </div>

    <AdminDashboardGlobalOverview :mockStats="mockStats" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';

definePageMeta({ layout: 'admin' });

const { $apiBase } = useNuxtApp() as any;
const { user } = useAuth();

const activeEvents = ref<any[]>([]);
const selectedEventSK = ref('');
const selectedEventGender = ref('umum'); 
const isLoadingEvents = ref(true);
const isLoadingEventData = ref(false);

const userRoleLabel = computed(() => {
  const role = user.value?.role;
  const roles: Record<string, string> = { root: 'Super Root', admin: 'Administrator' };
  return (role && roles[role]) ? roles[role] : 'Administrator';
});

const mockStats = ref({
  participants: { ikhwan: 1240, akhwat: 980, total: 2220 }
});

const eventStats = ref({
  totalQuota: 0, sold: 0, available: 0,
  soldIkhwan: 0, soldAkhwat: 0, checkInTotal: 0, checkInIkhwan: 0, checkInAkhwat: 0
});

onMounted(async () => {
  try {
    const res = await $apiBase.get('/get-dashboard?type=list-event');
    activeEvents.value = res.data || [];
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingEvents.value = false;
  }
});

const fetchEventDashboardData = async () => {
  if (!selectedEventSK.value) return;
  isLoadingEventData.value = true;

  try {
    // 🟢 1. Nembak API dari temen lu
    const res = await $apiBase.get('/get-dashboard', {
      params: { type: 'graphs', sk: selectedEventSK.value }
    });

    const data = res.data;

    if (data) {
      if (data.ikhwan && !data.akhwat && !data.mixed) {
        selectedEventGender.value = 'ikhwan';
      } else if (data.akhwat && !data.ikhwan && !data.mixed) {
        selectedEventGender.value = 'akhwat';
      } else {
        selectedEventGender.value = 'umum';
      }
      
      eventStats.value = {
        totalQuota: data.mixed?.totalTicket || (data.ikhwan?.totalTicket || 0) + (data.akhwat?.totalTicket || 0),
        sold: data.mixed?.totalSold || (data.ikhwan?.totalSold || 0) + (data.akhwat?.totalSold || 0),
        available: data.mixed?.totalNotSold || (data.ikhwan?.totalNotSold || 0) + (data.akhwat?.totalNotSold || 0),
        
        soldIkhwan: data.ikhwan?.totalSold || 0,
        soldAkhwat: data.akhwat?.totalSold || 0,
        
        checkInTotal: data.mixed?.totalCheckedIn || (data.ikhwan?.totalCheckedIn || 0) + (data.akhwat?.totalCheckedIn || 0),
        checkInIkhwan: data.ikhwan?.totalCheckedIn || 0,
        checkInAkhwat: data.akhwat?.totalCheckedIn || 0
      };
    }
  } catch (error) {
    console.error("Gagal menarik data dashboard event:", error);
  } finally {
    isLoadingEventData.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>