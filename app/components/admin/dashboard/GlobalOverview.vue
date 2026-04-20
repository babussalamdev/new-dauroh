<template>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mt-4">
    <div class="card-body p-0">
      
      <div class="p-3 px-4 d-flex align-items-center border-bottom bg-white">
        <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style="width: 32px; height: 32px;">
          <i class="bi bi-globe2"></i>
        </div>
        <div>
          <h6 class="txt-subtitle fw-bold m-0 text-dark">Sistem Global</h6>
          <p class="txt-caption text-muted mb-0">Ikhtisar data seluruh pengguna dan akses menu utama</p>
        </div>
      </div>

      <div class="p-3 px-4">
        <div class="row g-4 align-items-stretch"> 
          
          <div class="col-12 col-lg-5">
            <AdminDashboardDemographicsPie 
              :ikhwan="mockStats.participants.ikhwan" 
              :akhwat="mockStats.participants.akhwat" 
              class="inner-global-card h-100 bg-light rounded-4"
            />
          </div>

          <div class="col-12 col-lg-7 d-flex flex-column">
            <div class="mb-3">
              <h6 class="txt-body fw-bold mb-1 text-dark">Akses Cepat</h6>
              <p class="txt-caption text-muted mb-0">Navigasi instan untuk operasional harian</p>
            </div>
            
            <div class="row g-2 flex-grow-1">
              
              <div class="col-12 col-md-6">
                <NuxtLink to="/admin/events" class="text-decoration-none h-100 d-block">
                  <div class="p-3 border rounded-4 text-center action-card h-100 d-flex flex-column align-items-center justify-content-center inner-global-card bg-light">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 40px; height: 40px;">
                      <i class="bi bi-calendar-plus fs-5"></i>
                    </div>
                    <p class="txt-body fw-bold mb-0 text-dark">Kelola Event</p>
                  </div>
                </NuxtLink>
              </div>

              <div class="col-12 col-md-6">
                <NuxtLink to="/admin/kehadiran" class="text-decoration-none h-100 d-block">
                  <div class="p-3 border rounded-4 text-center action-card h-100 d-flex flex-column align-items-center justify-content-center inner-global-card bg-light">
                    <div class="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 40px; height: 40px;">
                      <i class="bi bi-qr-code-scan fs-5"></i>
                    </div>
                    <p class="txt-body fw-bold mb-0 text-dark">Scanner Presensi</p>
                  </div>
                </NuxtLink>
              </div>

              <div class="col-12 mt-2">
                <NuxtLink to="/admin/finance/reports" class="text-decoration-none">
                  <div class="p-2 px-3 border rounded-4 d-flex align-items-center justify-content-between action-card inner-global-card bg-light">
                    <div class="d-flex align-items-center">
                      <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-inline-flex align-items-center justify-content-center me-3" style="width: 35px; height: 35px;">
                        <i class="bi bi-file-earmark-bar-graph"></i>
                      </div>
                      <div>
                        <p class="txt-body fw-bold mb-0 text-dark">Laporan Keuangan</p>
                      </div>
                    </div>
                    <i class="bi bi-chevron-right text-muted txt-body"></i>
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
defineProps<{
  mockStats: any
}>();
</script>

<style scoped>
/* Pembeda warna buat card-card kecil di dalem */
.inner-global-card {
  background-color: #f8f9fa !important;
  border: 1px solid #f1f3f5 !important;
  box-shadow: none !important;
}

.action-card {
  transition: all 0.2s ease-in-out;
}

.action-card:hover {
  background-color: #ffffff !important;
  border-color: #dee2e6 !important;
  transform: translateY(-2px);
  box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
}
</style>