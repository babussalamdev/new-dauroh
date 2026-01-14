<template>
  <div class="container py-5">
    
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h3 class="fw-bold text-dark m-0"><i class="bi bi-clock-history me-2 text-primary"></i>Riwayat Pendaftaran</h3>
      </div>
      <div v-if="sortedTickets.length > 0">
        <span class="badge bg-white text-secondary border shadow-sm rounded-pill px-3 py-2">
          <i class="bi bi-receipt me-1"></i> {{ sortedTickets.length }} Transaksi
        </span>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      
      <div v-if="sortedTickets.length > 0" class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th scope="col" class="ps-4 py-3 text-uppercase text-secondary fs-7 fw-semibold">Tanggal & ID</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold">Event Info</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold">Peserta</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Status</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-end">Total</th>
              <th scope="col" class="pe-4 py-3 text-uppercase text-secondary fs-7 fw-semibold text-center" style="width: 150px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ticket, index) in sortedTickets" :key="ticket.SK || index">
              
              <td class="ps-4 py-3">
                <div class="d-flex flex-column">
                  <span class="fw-bold text-dark mb-1">{{ formatDate(ticket.created_at || ticket.date) }}</span>
                  <span class="badge bg-light text-secondary border rounded-1 fw-normal text-start" style="width: fit-content;">
                    {{ ticket.SK || ticket.id }}
                  </span>
                </div>
              </td>

              <td class="py-3" style="max-width: 200px;">
                <span class="d-block fw-bold text-primary text-truncate mb-1" :title="ticket.title || ticket.dauroh?.Title">
                  {{ ticket.title || ticket.dauroh?.Title || 'Event Dauroh' }}
                </span>
                <small class="text-muted d-flex align-items-center text-truncate">
                  <i class="bi bi-geo-alt-fill me-1 text-secondary opacity-50"></i>
                  {{ ticket.dauroh?.Place || 'Lokasi Online' }}
                </small>
              </td>

              <td class="py-3">
                <div class="d-flex flex-column gap-1">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-person-circle me-2 text-muted opacity-50 small"></i>
                    <span class="text-dark small fw-medium">
                      {{ ticket.participants?.[0]?.Name || 'Peserta' }}
                    </span>
                  </div>
                  <small v-if="(ticket.participants?.length || 0) > 1" class="text-muted ms-4" style="font-size: 0.75rem;">
                    + {{ (ticket.participants?.length || 1) - 1 }} lainnya
                  </small>
                </div>
              </td>

              <td class="py-3 text-center">
                <span class="badge rounded-pill px-3 py-2 status-badge" :class="getStatusClass(ticket.status)">
                  {{ ticket.status === 'PENDING' ? 'Menunggu' : ticket.status }}
                </span>
              </td>

              <td class="py-3 text-end">
                <span class="fw-bold text-dark fs-6">
                  {{ formatCurrency(ticket.amount || 0) }}
                </span>
              </td>

              <td class="pe-4 py-3 text-center">
                
                <div v-if="ticket.status === 'PENDING'" class="d-flex flex-column gap-2">
                  <button 
                    @click="resumePayment(ticket)" 
                    class="btn btn-sm btn-primary fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 w-100"
                    title="Lanjut ke halaman pembayaran"
                  >
                    <i class="bi bi-credit-card-2-front"></i> Bayar
                  </button>
                  <button 
                    @click="cancelBooking(ticket)" 
                    class="btn btn-sm btn-light border text-danger d-flex align-items-center justify-content-center gap-2 w-100 hover-danger"
                  >
                    <i class="bi bi-x-circle"></i> Batal
                  </button>
                </div>

                <div v-else-if="['PAID', 'Upcoming', 'Selesai', 'active'].includes(ticket.status)">
                  <button 
                    @click="showTicket(ticket)" 
                    class="btn btn-sm btn-success-subtle text-success border border-success fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <i class="bi bi-qr-code"></i> E-Tiket
                  </button>
                </div>

                <div v-else class="d-flex flex-column gap-2">
                  <NuxtLink 
                    :to="`/dauroh/register/${ticket.dauroh?.SK}`" 
                    class="btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <i class="bi bi-arrow-repeat"></i> Ulang
                  </NuxtLink>
                  <button 
                    @click="deleteHistory(ticket)" 
                    class="btn btn-sm btn-link text-muted text-decoration-none p-0 small"
                  >
                    <i class="bi bi-trash"></i> Hapus
                  </button>
                </div>

              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-5">
        <div class="bg-light rounded-circle d-inline-flex p-4 mb-3">
          <i class="bi bi-inbox text-secondary fs-1 opacity-50"></i>
        </div>
        <h5 class="fw-bold text-dark">Belum ada riwayat</h5>
        <p class="text-muted mb-4">Anda belum mendaftar di event manapun.</p>
        <NuxtLink to="/" class="btn btn-primary rounded-pill px-4 py-2 shadow-sm">
          <i class="bi bi-search me-2"></i>Cari Kajian
        </NuxtLink>
      </div>

    </div>

    <ModalsQrCodeModal 
      :show="showQr" 
      :ticket="selectedTicket" 
      @close="showQr = false" 
    />

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '~/stores/user';
import { useCheckoutStore } from '~/stores/checkout';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id'); // Set locale Indonesia

useHead({ title: 'Riwayat Pendaftaran' });

// Middleware Auth
definePageMeta({
  middleware: (to, from) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) return navigateTo('/login');
  }
});

const router = useRouter();
const userStore = useUserStore();
const checkoutStore = useCheckoutStore();

const showQr = ref(false);
const selectedTicket = ref<any>(null);

// Sorting data: Terbaru paling atas
const sortedTickets = computed(() => {
  if (!userStore.tickets) return [];
  return [...userStore.tickets].sort((a, b) => {
    const dateA = new Date(a.created_at || a.date).getTime();
    const dateB = new Date(b.created_at || b.date).getTime();
    return dateB - dateA;
  });
});

// --- ACTIONS ---

// 1. 🔥 Bayar Sekarang
const resumePayment = (ticket: any) => {
  // Masukkan data ke store checkout agar halaman instruksi tahu apa yang harus dibayar
  checkoutStore.dauroh = ticket.dauroh;
  checkoutStore.participants = ticket.participants || [];
  
  checkoutStore.transactionDetails = {
    ...ticket,
    status: ticket.status,
    amount: ticket.amount,
    vaNumber: ticket.va_number || ticket.receiver_bank_account?.account_number, 
    expiryTime: ticket.expired_date,
    paymentMethod: ticket.sender_bank || 'Bank',
  };

  router.push('/checkout/instructions');
};

// 2. Batalkan Pesanan
const cancelBooking = async (ticket: any) => {
  const result = await Swal.fire({
    title: 'Batalkan Pendaftaran?',
    text: "Pendaftaran yang dibatalkan akan dihapus dari sistem.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#e9ecef',
    cancelButtonText: '<span class="text-dark">Kembali</span>',
    confirmButtonText: 'Ya, Batalkan'
  });

  if (result.isConfirmed) {
    // Hapus dari local storage
    userStore.removeTicket(ticket.SK || ticket.id);
    Swal.fire({
      title: 'Dibatalkan!',
      text: 'Pendaftaran berhasil dibatalkan.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }
};

// 3. 🎫 Lihat E-Tiket
const showTicket = (ticket: any) => {
  selectedTicket.value = {
    dauroh: ticket.dauroh,
    participants: ticket.participants
  };
  showQr.value = true;
};

// 4. Hapus Riwayat (Sampah)
const deleteHistory = async (ticket: any) => {
  const result = await Swal.fire({
    title: 'Hapus Riwayat?',
    text: "Data ini akan dihapus permanen.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Hapus'
  });

  if (result.isConfirmed) {
    userStore.removeTicket(ticket.SK || ticket.id);
  }
};

// --- Helpers Formatter ---

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return dayjs(dateString).format('D MMM YYYY');
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

const getStatusClass = (status: string) => {
  if (!status) return 'bg-light text-secondary';
  const s = status.toLowerCase();
  
  if (['upcoming', 'paid', 'success', 'active'].includes(s)) {
    return 'bg-success-subtle text-success border border-success-subtle';
  } else if (['pending', 'waiting'].includes(s)) {
    return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
  } else if (['cancelled', 'failed', 'expired'].includes(s)) {
    return 'bg-danger-subtle text-danger border border-danger-subtle';
  } else {
    return 'bg-light text-secondary border';
  }
};
</script>

<style scoped>
/* Custom Table Styling */
.table thead th {
  font-size: 0.75rem; 
  letter-spacing: 0.5px;
  border-bottom: 1px solid #eee;
}

.table tbody td {
  font-size: 0.9rem;
  border-bottom: 1px solid #f8f9fa;
}

.table-hover tbody tr:hover {
  background-color: #fcfcfc;
}

.status-badge {
  font-weight: 600;
  font-size: 0.75rem;
}

.fs-7 {
  font-size: 0.75rem !important;
}

/* Button & Color Utilities */
.hover-danger:hover {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
  border-color: #fee2e2 !important;
}

.bg-success-subtle { background-color: #ecfdf5; }
.bg-warning-subtle { background-color: #fffbeb; }
.bg-danger-subtle { background-color: #fef2f2; }
.btn-success-subtle { background-color: #ecfdf5; border-color: #10b981; }
.btn-success-subtle:hover { background-color: #d1fae5; }
</style>