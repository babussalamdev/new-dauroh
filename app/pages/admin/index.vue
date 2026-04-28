<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <div class="card border-0 shadow-sm rounded-4 mb-3 bg-white">
      <div class="card-body p-3 px-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div>
          <h3 class="mb-1 text-dark txt-title">Ahlan wa Sahlan, {{ user?.name || 'Admin' }}! 👋</h3>
          
          <p class="text-muted mb-0 txt-caption">
            Dashboard manajemen sistem 
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 ms-1 txt-label">
              {{ userRoleLabel }}
            </span>
          </p>
        </div>
        
        <div class="d-flex flex-column flex-sm-row gap-2 text-md-end">
          
          <div class="input-group input-group-sm shadow-sm rounded-pill overflow-hidden" 
     style="width: 200px; border: 1px solid #ced4da; height: 38px;"> 
  <span class="input-group-text bg-light border-0 py-1 ps-3 pe-0">
    <i class="bi bi-calendar text-muted" style="font-size: 0.8rem;"></i>
  </span>
  <input type="month" 
         class="form-control border-0 txt-caption fw-medium ps-2 pe-3 py-1 shadow-none"
         style="font-size: 0.75rem; background-color: #f8f9fa; height: 100%;"
         v-model="selectedMonthYear" 
         @change="fetchEventsByMonth" 
         :disabled="isLoadingEvents">
</div>

<select class="form-select form-select-sm border-success shadow-sm rounded-pill px-3 py-1 txt-caption fw-medium"
        v-model="selectedEventSK" 
        @change="handleEventSelection" 
        :disabled="isLoadingEvents || activeEvents.length === 0" 
        style="width: 250px; height: 38px;">
  <option value="" disabled>{{ isLoadingEvents ? 'Memuat...' : (activeEvents.length === 0 ? 'Event Kosong' : '-- Pilih Event --') }}</option>
  
  <option v-for="event in activeEvents" :key="event.SK" :value="event.SK" :title="event.Title.toUpperCase()">
    {{ event.Title.length > 25 ? event.Title.substring(0, 25).toUpperCase() + '...' : event.Title.toUpperCase() }}
  </option>
</select>

        </div>
      </div>
    </div>

    <div v-if="globalStore.activeEventSK" class="animate-fade-in mb-4">
      <CommonLoadingSpinner v-if="isLoadingEventData" class="my-4" />
      <div v-else>
        <AdminDashboardEventStats :stats="eventStats" />
        <AdminDashboardAttendanceRatio :stats="eventStats" :genderType="selectedEventGender" />
      </div>
    </div>
    
    <div v-else class="text-center py-5 my-4 bg-white rounded-4 shadow-sm border-0">
      <i class="bi bi-calendar2-check text-muted opacity-50 d-block mb-3" style="font-size: 3rem;"></i>
      <h6 class="txt-subtitle text-dark fw-bold">Pilih Event Untuk Dikelola</h6>
      <p class="txt-body text-muted mb-0">Silakan pilih bulan/tahun dan klik event pada menu di atas.</p>
    </div>

    <AdminDashboardGlobalOverview :mockStats="mockStats" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useNuxtApp } from '#app';
import { useGlobalEventStore } from '~/stores/globalEvent';

useHead({ title: 'Dashboard Admin' });

definePageMeta({ layout: 'admin' });

const { $apiBase } = useNuxtApp() as any;
const { user } = useAuth();
const globalStore = useGlobalEventStore();

// Default value input type="month" adalah "YYYY-MM"
const selectedMonthYear = ref(
  `${globalStore.selectedYear}-${String(globalStore.selectedMonth).padStart(2, '0')}`
);

const activeEvents = ref<any[]>([]);
const selectedEventSK = ref(globalStore.activeEventSK || '');
const selectedEventGender = ref('umum');
const isLoadingEvents = ref(false);
const isLoadingEventData = ref(false);

const userRoleLabel = computed(() => {
  const role = user.value?.role;
  const roles: Record<string, string> = { root: 'Root', admin: 'Administrator' };
  return (role && roles[role]) ? roles[role] : 'Administrator';
});

const mockStats = ref({
  participants: { ikhwan: 1240, akhwat: 980, total: 2220 }
});

const eventStats = ref({
  totalQuota: 0, sold: 0, available: 0,
  soldIkhwan: 0, soldAkhwat: 0, checkInTotal: 0, checkInIkhwan: 0, checkInAkhwat: 0
});

const fetchEventsByMonth = async () => {
  if (!selectedMonthYear.value) return;
  isLoadingEvents.value = true;
  activeEvents.value = [];
  const [year, month] = selectedMonthYear.value.split('-');
  globalStore.setYearMonth(Number(year), Number(month));

  try {
    const res = await $apiBase.get('/get-dashboard', {
      params: { 
        type: 'list-event', 
        yrmth: selectedMonthYear.value 
      } 
    });
    
    // Taruh hasil array dari BE ke state activeEvents
    activeEvents.value = res.data || [];
    
    // Kalau event yang aktif sekarang ga ada di daftar bulan ini, reset pilihannya
    if (!activeEvents.value.some(e => e.SK === selectedEventSK.value)) {
      selectedEventSK.value = '';
      globalStore.clearActiveEvent();
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingEvents.value = false;
  }
};

const handleEventSelection = () => {
  const selected = activeEvents.value.find(e => e.SK === selectedEventSK.value);
  if (selected) {
    globalStore.setActiveEvent(selected.SK, selected.Title);
    fetchEventDashboardData();
  }
};

const fetchEventDashboardData = async () => {
  if (!globalStore.activeEventSK) return;
  isLoadingEventData.value = true;

  try {
    const res = await $apiBase.get('/get-dashboard', {
      params: { type: 'graphs', sk: globalStore.activeEventSK }
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


onMounted(async () => {
 
  await fetchEventsByMonth();
  if (globalStore.activeEventSK) {
    fetchEventDashboardData();
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

input[type="month"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
}
</style>