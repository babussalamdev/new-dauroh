<template>
  <div class="user-dashboard bg-light">
    <div class="container py-5">
      <div v-if="isLoggedIn">
        <div class="row g-4">
          
          <div class="col-lg-8">
            
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center"> 
                <h5 class="mb-0"><i class="bi bi-calendar-check me-2"></i>Dauroh yang Akan Datang</h5>
                <span class="badge bg-primary rounded-pill">{{ upcomingTickets.length }} Tiket</span>
              </div>
              <div class="card-body">
                <div v-if="upcomingTickets.length > 0">
                  <div 
                    v-for="(ticket, index) in visibleUpcoming" 
                    :key="index" 
                    class="d-flex align-items-center mb-3 pb-3 border-bottom ticket-item"
                  >
                    <img 
                      :src="ticket.dauroh.Picture ? `${imgBaseUrl}/${ticket.dauroh. SK}/${ticket.dauroh.Picture}.webp` : ''" 
                      class="rounded shadow-sm ticket-img" 
                      style="width: 70px; height: 100px; object-fit: cover;" 
                      :alt="ticket.dauroh.Title"
                    >
                    
                    <div class="ms-3 flex-grow-1 ticket-info">
                      <h6 class="fw-bold mb-1">{{ ticket.dauroh.Title }}</h6>
                      <p class="text-primary fw-bold mb-1 small">Atas Nama: {{ ticket.participant.name }}</p>
                      <p class="text-muted mb-1 small">{{ ticket.dauroh.Gender }}</p>
                      <span class="badge bg-success">Terdaftar</span>
                    </div>

                    <div class="d-flex flex-row flex-md-column gap-2 ms-md-2 ticket-actions" style="min-width: 140px;">
                      <button class="btn btn-primary btn-sm flex-fill" @click="openQrModal(ticket)">
                        <i class="bi bi-qr-code me-1 d-none d-sm-inline"></i> E-Tiket
                      </button>
                      <button class="btn btn-outline-primary btn-sm flex-fill" @click="handleDownloadReceipt(ticket)">
                        <i class="bi bi-receipt me-1 d-none d-sm-inline"></i> Bukti
                      </button>
                    </div>
                  </div>

                  <div v-if="upcomingTickets.length > defaultLimit" class="text-center mt-2">
                    <button 
                      class="btn btn-link text-decoration-none small" 
                      @click="showAllUpcoming = !showAllUpcoming"
                    >
                      {{ showAllUpcoming ? 'Tutup Tampilan' : `Lihat ${upcomingTickets.length - defaultLimit} Tiket Lainnya` }} 
                      <i :class="showAllUpcoming ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                    </button>
                  </div>

                </div>
                
                <div v-else class="text-center text-muted py-4">
                  <p>Anda belum terdaftar di Dauroh manapun.</p>
                  <NuxtLink to="/" class="btn btn-primary">Cari Dauroh Sekarang</NuxtLink>
                </div>
              </div>
            </div>

            <div class="card shadow-sm">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Riwayat Dauroh</h5>
              </div>
              <div class="card-body">
                <div v-if="historyTickets.length > 0">
                  <div 
                    v-for="(ticket, index) in visibleHistory" 
                    :key="ticket.id" 
                    class="d-flex align-items-center mb-3 pb-3 border-bottom ticket-item"
                  >
                    <img :src="ticket.dauroh.Picture ? `${imgBaseUrl}/${ticket.dauroh. SK}/${ticket.dauroh.Picture}.webp` : ''" class="rounded shadow-sm ticket-img" style="width: 70px; height: 100px; object-fit: cover;" :alt="ticket.dauroh.Title">
                    <div class="ms-3 flex-grow-1 ticket-info">
                      <h6 class="fw-bold mb-1">{{ ticket.dauroh.Title }}</h6>
                      <p class="text-primary fw-bold mb-1 small">Atas Nama: {{ ticket.participant.name }}</p>
                      <p class="text-muted mb-1 small">{{ ticket.dauroh.Gender }}</p>
                      <span class="badge bg-secondary">Selesai</span>
                    </div>
                    
                    <div class="d-flex flex-row flex-md-column gap-2 ms-md-2 ticket-actions" style="min-width: 140px;">
                      <button class="btn btn-outline-secondary btn-sm flex-fill" @click="downloadCertificate(ticket.dauroh)">
                        <i class="bi bi-award me-1 d-none d-sm-inline"></i> Sertif
                      </button>
                      <button class="btn btn-outline-primary btn-sm flex-fill" @click="handleDownloadReceipt(ticket)">
                         <i class="bi bi-receipt me-1 d-none d-sm-inline"></i> Bukti
                      </button>
                    </div>
                  </div>

                   <div v-if="historyTickets.length > defaultLimit" class="text-center mt-2">
                    <button 
                      class="btn btn-link text-decoration-none small" 
                      @click="showAllHistory = !showAllHistory"
                    >
                      {{ showAllHistory ? 'Tutup Tampilan' : `Lihat ${historyTickets.length - defaultLimit} Riwayat Lainnya` }} 
                      <i :class="showAllHistory ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                    </button>
                  </div>

                </div>
                <div v-else class="text-center text-muted py-3">
                  <p class="mb-0">Belum ada riwayat dauroh yang selesai.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0"><i class="bi bi-person-fill me-2"></i>Profil Saya</h5>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex align-items-center">
                  <i class="bi bi-person-circle fs-2 me-3 text-primary"></i>
                  <div>
                    <h6 class="fw-bold mb-0">{{ userName }}</h6>
                    <span class="text-muted small">{{ userEmail }}</span>
                  </div>
                </li>
                <li class="list-group-item">
                  <small class="text-muted">Tanggal Bergabung</small>
                  <p class="fw-bold mb-0">{{ joinedDate }}</p>
                </li>
              </ul>
              <div class="card-body">
                <NuxtLink to='/profile/edit' class="btn btn-outline-secondary w-100">
                  Edit Profil</NuxtLink>
              </div>
            </div>
            <div class="card shadow-sm">
               <div class="card-header bg-white py-3">
                <h5 class="mb-0"><i class="bi bi-question-circle-fill me-2"></i>Bantuan</h5>
              </div>
               <div class="list-group list-group-flush">
                <a href="#" class="list-group-item list-group-item-action">Pusat Bantuan</a>
                <a href="#" class="list-group-item list-group-item-action">Hubungi Kami</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    
    <ModalsQrCodeModal :show="showQrModal" :ticket="selectedTicket" @close="closeQrModal" />
    
    <BankPaymentReceipt ref="receiptRef" :customData="receiptData" />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import Swal from 'sweetalert2';
import { useAuth } from '~/composables/useAuth';

const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');

const { user, isLoggedIn, userName, userEmail } = useAuth();
const userStore = useUserStore();

const showQrModal = ref(false);
const selectedTicket = ref(null);
const receiptRef = ref(null);
const receiptData = ref(null);

// --- LOGIK "LIHAT LEBIH BANYAK" ---
const defaultLimit = 2; // Cuma tampilkan 2 tiket awal
const showAllUpcoming = ref(false);
const showAllHistory = ref(false);

const upcomingTickets = computed(() => userStore.getUpcomingTickets);
const historyTickets = computed(() => userStore.getHistoryTickets);

const visibleUpcoming = computed(() => {
  if (showAllUpcoming.value) return upcomingTickets.value;
  return upcomingTickets.value.slice(0, defaultLimit);
});

const visibleHistory = computed(() => {
  if (showAllHistory.value) return historyTickets.value;
  return historyTickets.value.slice(0, defaultLimit);
});
// ----------------------------------

const openQrModal = (ticket) => {
  selectedTicket.value = ticket;
  showQrModal.value = true;
};
const closeQrModal = () => {
  showQrModal.value = false;
  selectedTicket.value = null;
};

const joinedDate = computed(() => {
  return user.value?.joined_date || 'Tanggal tidak tersedia';
});

const downloadCertificate = (dauroh) => {
  Swal.fire({
    title: 'Fitur Segera Hadir',
    text: `Fitur unduh sertifikat untuk "${dauroh.Title}" sedang dalam pengembangan.`,
    icon: 'info',
    confirmButtonText: 'Mengerti'
  });
};

const handleDownloadReceipt = (ticket) => {
  // Simulasi data
  receiptData.value = {
    amount: ticket.dauroh.Price || 0,
    paymentMethod: 'BSI', 
    vaNumber: '9888442365281',
    date: '2025-11-19 10:00:00',
    participantCount: 1 
  };
  setTimeout(() => {
    receiptRef.value?.downloadPdf();
  }, 100);
};
</script>

<style scoped>
.user-dashboard {
  min-height: calc(100vh - 56px);
}
.card {
  border: none;
}
.card-header {
  border-bottom: 0;
}

/* --- CSS KHUSUS MOBILE BIAR TIDAK NUMPUK --- */
@media (max-width: 767.98px) {
  /* 1. Item jadi wrap (turun ke bawah) */
  .ticket-item {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
    padding-bottom: 1.5rem !important;
  }

  /* 2. Gambar di tengah */
  .ticket-img {
    margin-bottom: 1rem;
    width: 90px !important;
    height: 130px !important; /* Gambar agak gede dikit biar cakep */
  }

  /* 3. Info lebar penuh */
  .ticket-info {
    flex-basis: 100%;
    margin-left: 0 !important;
    margin-bottom: 1rem;
  }

  /* 4. Tombol JEJER SAMPING (Horizontal) */
  .ticket-actions {
    width: 100%;
    margin-left: 0 !important;
    /* Kita paksa flex-row di mobile lewat class d-flex flex-row di HTML */
  }

  /* Tombol lebih enak ditap */
  .ticket-actions .btn {
    padding: 0.5rem 0; 
    font-size: 0.9rem;
  }
}
</style>