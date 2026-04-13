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
        <div class="text-md-end">
          <div class="d-inline-flex align-items-center px-3 py-2 bg-light border rounded-pill">
            <i class="bi bi-calendar2-week text-primary me-2"></i>
            <span class="text-muted small fw-medium">{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <AdminDashboardStatCard 
          title="Total Tiket Event" 
          :value="mockStats.totalTickets" 
          icon="bi-ticket-perforated"
          iconBgClass="bg-primary bg-opacity-10 text-primary" 
        />
      </div>
      <div class="col-12 col-md-4">
        <AdminDashboardStatCard 
          title="Tiket Aktif" 
          :value="mockStats.activeTickets" 
          icon="bi-check-circle"
          iconBgClass="bg-success bg-opacity-10 text-success"
        />
      </div>
      <div class="col-12 col-md-4">
        <AdminDashboardStatCard 
          title="Tiket Tidak Aktif" 
          :value="mockStats.inactiveTickets" 
          icon="bi-x-circle"
          iconBgClass="bg-secondary bg-opacity-10 text-secondary"
        />
      </div>
    </div>

    <div class="row g-3">
      
      <div class="col-12 col-lg-4">
        <AdminDashboardDemographicsPie 
          :ikhwan="mockStats.participants.ikhwan" 
          :akhwat="mockStats.participants.akhwat" 
        />
      </div>

      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100">
          <div class="card-body p-4 d-flex flex-column">
            
            <div class="mb-4">
              <h6 class="fw-bold mb-1 text-dark">Pusat Kendali</h6>
              <p class="small text-muted mb-0">Navigasi instan untuk operasional harian sistem Anda.</p>
            </div>
            
            <div class="row g-3 flex-grow-1">
              
              <div class="col-12 col-md-6">
                <NuxtLink to="/admin/events" class="text-decoration-none">
                  <div class="p-4 border rounded-4 text-center action-card h-100 d-flex flex-column align-items-center justify-content-center">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 55px; height: 55px;">
                      <i class="bi bi-calendar-plus fs-3"></i>
                    </div>
                    <h6 class="fw-bold mb-1 text-dark">Kelola Event</h6>
                    <p class="small text-muted mb-0">Buat atau edit detail event.</p>
                  </div>
                </NuxtLink>
              </div>

              <div class="col-12 col-md-6">
                <NuxtLink to="/admin/kehadiran" class="text-decoration-none">
                  <div class="p-4 border rounded-4 text-center action-card h-100 d-flex flex-column align-items-center justify-content-center">
                    <div class="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 55px; height: 55px;">
                      <i class="bi bi-qr-code-scan fs-3"></i>
                    </div>
                    <h6 class="fw-bold mb-1 text-dark">Scanner Presensi</h6>
                    <p class="small text-muted mb-0">Scan barcode tiket peserta.</p>
                  </div>
                </NuxtLink>
              </div>

              <div class="col-12">
                <NuxtLink to="/admin/finance/reports" class="text-decoration-none">
                  <div class="p-3 border rounded-4 d-flex align-items-center justify-content-between action-card">
                    <div class="d-flex align-items-center">
                      <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-inline-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px;">
                        <i class="bi bi-file-earmark-bar-graph fs-5"></i>
                      </div>
                      <div>
                        <h6 class="fw-bold mb-0 text-dark">Laporan Keuangan</h6>
                        <p class="small text-muted mb-0">Unduh rekapitulasi transaksi Excel & PDF.</p>
                      </div>
                    </div>
                    <i class="bi bi-chevron-right text-muted me-2"></i>
                  </div>
                </NuxtLink>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/');
  }
});

const { user } = useAuth();
const currentDate = computed(() => dayjs().format('dddd, DD MMMM YYYY'));

const userRoleLabel = computed(() => {
  const role = user.value?.role;
  const roles: Record<string, string> = {
    root: 'Super Root', super_role: 'Super Admin', admin: 'Administrator',
    bendahara: 'Bendahara', registrasi: 'Petugas Registrasi', user: 'User'
  };
  return (role && roles[role]) ? roles[role] : 'Administrator';
});

const mockStats = ref({
  totalTickets: 45,
  activeTickets: 12,
  inactiveTickets: 33,
  participants: {
    ikhwan: 1240, 
    akhwat: 980,
    total: 2220
  }
});
</script>

<style scoped>
.action-card {
  background-color: #ffffff;
  transition: all 0.2s ease-in-out;
}

.action-card:hover {
  background-color: #f8f9fa;
  border-color: #0d6efd !important;
  transform: translateY(-2px);
}
</style>