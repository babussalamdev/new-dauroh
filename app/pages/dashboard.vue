<template>
  <div class="user-dashboard bg-light">
    <div class="container py-5">
      <div v-if="isLoggedIn">
        <div class="row g-4">
          
          <div class="col-lg-12">
            
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center"> 
                <h5 class="mb-0 fw-bold"><i class="bi bi-calendar-event me-2 text-primary"></i>Dauroh Aktif</h5>
                <span class="badge bg-primary rounded-pill">{{ upcomingTickets.length }} Event</span>
              </div>
              <div class="card-body">
                <div v-if="upcomingTickets.length > 0" class="row g-3">
                  <div v-for="(ticket, index) in upcomingTickets" :key="'card-'+index" class="col-md-6 col-lg-4">
                    <div class="card h-100 border shadow-sm overflow-hidden">
                      <div class="d-flex">
                        <img 
                          :src="ticket.dauroh.Picture ? `${imgBaseUrl}/${ticket.dauroh. SK}/${ticket.dauroh.Picture}.webp` : ''" 
                          class="bg-light"
                          style="width: 100px; object-fit: cover;" 
                          :alt="ticket.dauroh.Title"
                        >
                        <div class="p-3 d-flex flex-column justify-content-center">
                          <h6 class="fw-bold mb-1 text-truncate-2">{{ ticket.dauroh.Title }}</h6>
                          <p class="text-muted mb-1 small"><i class="bi bi-geo-alt me-1"></i>{{ ticket.dauroh.Place }}</p>
                          <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill w-auto align-self-start">
                            Akan Datang
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-center text-muted py-5 bg-light rounded-3 border border-dashed">
                  <i class="bi bi-ticket-perforated fs-1 text-secondary mb-2"></i>
                  <p class="mb-0">Tidak ada dauroh aktif saat ini.</p>
                  <NuxtLink to="/" class="btn btn-primary btn-sm mt-3 rounded-pill px-4">Cari Dauroh</NuxtLink>
                </div>
              </div>
            </div>

            <div class="card shadow-sm border-0">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0 fw-bold"><i class="bi bi-receipt me-2 text-primary"></i>Riwayat Pembayaran & Tiket</h5>
              </div>
              <div class="card-body p-0">
                <div v-if="upcomingTickets.length > 0" class="table-responsive">
                  <table class="table table-bordered table-hover table-sm align-middle fs-sm">
                    <thead class="table-light">
                      <tr>
                        <th class="ps-4">ID Transaksi</th>
                        <th>Event</th>
                        <th>Peserta</th>
                        <th class="text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(ticket, index) in upcomingTickets" :key="'row-'+index">
                        <td class="ps-4">
                          <span class="font-monospace small text-muted">#{{ ticket.SK.slice(-6) }}</span>
                          <br>
                          <span class="badge bg-success">Lunas</span>
                        </td>
                        <td>
                          <span class="fw-bold d-block text-truncate" style="max-width: 200px;">{{ ticket.dauroh.Title }}</span>
                          <small class="text-muted">{{ formatCurrency(ticket.dauroh.Title) }}</small>
                        </td>
                        <td>
                          <div v-for="p in ticket.participants" :key="p.name" class="small fw-medium">
                            <i class="bi bi-person me-1 text-secondary"></i> {{ p.name }}
                          </div>
                        </td>
                        <td class="text-center">
                          <button 
                          class="btn btn-primary btn-sm rounded px-2 px-md-3 text-nowrap" 
                          @click="openQrModal(ticket)"
                          title="Lihat QR Code"
                          >
                          <i class="bi bi-qr-code"></i>
                          <span class="d-none d-md-inline ms-1">Lihat QR</span>
                        </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-center py-4 text-muted">
                  <small>Belum ada data pembayaran.</small>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <ModalsQrCodeModal :show="showQrModal" :ticket="selectedTicket" @close="closeQrModal" />
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import { useAuth } from '~/composables/useAuth';

const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');
const { isLoggedIn } = useAuth();
const userStore = useUserStore();

const showQrModal = ref(false);
const selectedTicket = ref(null);

const upcomingTickets = computed(() => userStore.getUpcomingTickets);

const openQrModal = (ticket) => {
  selectedTicket.value = ticket;
  showQrModal.value = true;
};

const closeQrModal = () => {
  showQrModal.value = false;
  selectedTicket.value = null;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
</script>

<style scoped>
@import url("~/assets/css/admin/tables.css");
.user-dashboard {
  min-height: calc(100vh - 56px);
}
.text-truncate-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>