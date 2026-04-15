<template>
  <div class="mt-5">
    <div class="bg-white rounded-4 shadow-sm p-3 mb-3 d-flex align-items-center">
      <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
        <i class="bi bi-globe2 fs-5"></i>
      </div>
      <h6 class="fw-bold m-0 text-dark">Sistem Global</h6>
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
              <h6 class="fw-bold mb-1 text-dark">Akses Cepat</h6>
              <p class="small text-muted mb-0">Navigasi instan untuk operasional harian sistem</p>
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
defineProps<{
  mockStats: any
}>();
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