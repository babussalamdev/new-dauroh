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
      
      <div v-if="userStore.isLoading" class="text-center py-5">
         <div class="spinner-border text-primary" role="status"></div>
         <p class="text-muted mt-2 small">Memuat data...</p>
      </div>

      <div v-else-if="sortedTickets.length > 0" class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th scope="col" class="ps-4 py-3 text-uppercase text-secondary fs-7 fw-semibold">Tanggal & ID</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold">Event Info</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Peserta</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Status</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-end">Total</th>
              <th scope="col" class="pe-4 py-3 text-uppercase text-secondary fs-7 fw-semibold text-center" style="width: 150px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ticket, index) in sortedTickets" :key="ticket.SK || index">
              
              <td class="ps-4 py-3">
                <div class="d-flex flex-column">
                  <span class="fw-bold text-dark mb-1">{{ formatDate(ticket.CreatedAt || ticket.created_at || ticket.date) }}</span>
                  <span class="badge bg-light text-secondary border rounded-1 fw-normal text-start" style="width: fit-content;">
                    {{ ticket.SK }}
                  </span>
                </div>
              </td>

              <td class="py-3" style="max-width: 200px;">
                <span class="d-block fw-bold text-primary text-truncate mb-1" :title="ticket.Title || ticket.title || ticket.dauroh?.Title">
                  {{ ticket.Title || ticket.title || ticket.dauroh?.Title || 'Event Dauroh' }}
                </span>
                <small class="text-muted d-flex align-items-center text-truncate">
                  <i class="bi bi-geo-alt-fill me-1 text-secondary opacity-50"></i>
                  {{ ticket.dauroh?.Place || 'Lokasi Online' }}
                </small>
              </td>

              <td class="py-3 text-center">
                <span class="text-dark fs-10">
                  {{ ticket.participants?.length || 1 }} Peserta
                </span>
              </td>

<td class="py-3 text-center">
  <span class="fw-bold text-primary small">#{{ ticket.SK.slice(-6).toUpperCase() }}</span>

  <span v-if="getSmartStatus(ticket) === 'PAID'" class="text-success small-8 fw-medium">
    <i class="bi bi-check-circle-fill me-1"></i>Pembayaran Lunas
  </span>

  <span v-else-if="['EXPIRED', 'CANCELLED', 'FAILED'].includes(getSmartStatus(ticket))" class="text-danger small-8 fw-medium">
    <i class="bi bi-x-circle-fill me-1"></i>Kadaluarsa
  </span>

  <div v-else-if="getSmartStatus(ticket) === 'PENDING'" class="d-flex flex-column">
    <span class="text-warning small-8 fw-medium">
      <i class="bi bi-hourglass-split me-1"></i>Menunggu Pembayaran
    </span>
    <span class="text-muted small-7" style="font-size: 0.75rem;">
      Bayar sebelum: {{ formatTime(ticket.Expired_Date || ticket.expired_date) }}
    </span>
  </div>

  <span v-else class="text-secondary small-8 fw-medium">
    {{ getSmartStatus(ticket) }}
  </span>
</td>

              <td class="py-3 text-end">
                <span class="fw-bold text-dark fs-6">
                  {{ formatCurrency(ticket.amount || 0) }}
                </span>
              </td>

              <td class="pe-4 py-3 text-center">
                
                <div class="d-flex flex-column gap-2">
                  
                  <button 
                    @click="openDetailModal(ticket)" 
                    class="btn btn-sm btn-outline-secondary border shadow-sm w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    <i class="bi bi-eye"></i> Detail
                  </button>

                  <button 
                    v-if="['EXPIRED', 'CANCELLED', 'FAILED'].includes(getSmartStatus(ticket))"
                    class="btn btn-sm btn-danger shadow-sm w-100 d-flex align-items-center justify-content-center gap-2 text-white"
                    @click="resumePayment(ticket)"
                  >
                    <i class="bi bi-arrow-clockwise"></i> Bayar Ulang
                  </button>

                  <button 
                    v-else-if="getSmartStatus(ticket) === 'PENDING'"
                    class="btn btn-sm btn-primary shadow-sm w-100 d-flex align-items-center justify-content-center gap-2 text-white"
                    @click="resumePayment(ticket)"
                  >
                    <i class="bi bi-credit-card-2-front"></i> Bayar
                  </button>

                  <span 
                    v-else-if="getSmartStatus(ticket) === 'PAID'"
                    class="text-success x-small fst-italic mt-1"
                  >
                    <i class="bi bi-check-all"></i> Selesai
                  </span>

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

    <div v-if="showDetail" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Detail Peserta</h5>
            <button type="button" class="btn-close" @click="closeDetailModal"></button>
          </div>

          <div class="modal-body">
            <div v-if="selectedTicketDetail" class="mb-3">
              <h6 class="text-primary fw-bold mb-1">{{ selectedTicketDetail.Title || selectedTicketDetail.title || selectedTicketDetail.dauroh?.Title }}</h6>
              <small class="text-muted">ID: {{ selectedTicketDetail.SK }}</small>
            </div>

            <div class="card bg-light border-0 rounded-3 overflow-hidden">
              <table class="table table-sm table-borderless align-middle mb-0">
                <thead class="border-bottom">
                  <tr class="text-secondary small">
                    <th class="ps-3 py-2">Nama Peserta</th>
                    <th class="text-end pe-3">Tiket</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, idx) in selectedTicketDetail?.participants" :key="idx">
                    <td class="ps-3 py-2">
                      <div class="fw-bold text-dark">{{ p.Name }}</div>
                      <small class="text-muted" style="font-size: 0.75rem;">{{ p.Gender || 'Umum' }}</small>
                    </td>
                    <td class="text-end pe-3">
                      <button 
                        v-if="getSmartStatus(selectedTicketDetail) === 'PAID'"
                        @click="showIndividualQr(selectedTicketDetail, p)"
                        class="btn btn-sm btn-primary py-1 px-3 rounded-pill"
                        style="font-size: 0.75rem;"
                      >
                        <i class="bi bi-qr-code me-1"></i> QR
                      </button>
                      <span v-else class="badge bg-secondary opacity-50">Belum Lunas</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

             <div v-if="getSmartStatus(selectedTicketDetail) !== 'PAID'" class="alert alert-warning d-flex align-items-center mt-3 mb-0 p-2 small">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>Selesaikan pembayaran untuk melihat QR Tiket.</div>
             </div>
          </div>
          
          <div class="modal-footer border-top-0 pt-0">
             <button type="button" class="btn btn-light w-100 rounded-pill" @click="closeDetailModal">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <ModalsQrCodeModal 
      :show="showQr" 
      :ticket="qrPayload" 
      @close="showQr = false" 
    />

  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2';
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '~/stores/user';
import { useCheckoutStore } from '~/stores/checkout';
import { useDaurohStore } from '~/stores/dauroh'; 
import { useTransactionStatus } from '~/composables/useTransactionStatus';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id'); 

useHead({ title: 'Riwayat Pendaftaran' });

definePageMeta({
  middleware: (to, from) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) return navigateTo('/login');
  }
});

const router = useRouter();
const userStore = useUserStore();
const checkoutStore = useCheckoutStore();
const daurohStore = useDaurohStore();
const { getSmartStatus } = useTransactionStatus();

onMounted(async () => {
  if (daurohStore.tiketDauroh.length === 0) {
      await daurohStore.fetchPublicTiketDauroh();
  }
  userStore.fetchUserTransactions();
});

const showDetail = ref(false);
const selectedTicketDetail = ref<any>(null);
const showQr = ref(false);
const qrPayload = ref<any>(null);

const sortedTickets = computed(() => {
  if (!userStore.tickets) return [];
  return [...userStore.tickets].sort((a, b) => {
    const dateA = new Date(a.CreatedAt || a.created_at || a.date).getTime();
    const dateB = new Date(b.CreatedAt || b.created_at || b.date).getTime();
    return dateB - dateA;
  });
});

const formatTime = (dateString: string) => {
  if (!dateString) return '-';
  return dayjs(dateString).format('DD MMM • HH:mm');
};

const openDetailModal = (ticket: any) => {
  selectedTicketDetail.value = ticket;
  showDetail.value = true;
};

const closeDetailModal = () => {
  showDetail.value = false;
  selectedTicketDetail.value = null;
};

const showIndividualQr = (ticket: any, specificParticipant: any) => {
  qrPayload.value = {
    dauroh: ticket.dauroh,
    participants: [specificParticipant],
    SK: ticket.SK 
  };
  showQr.value = true;
};

const resumePayment = async (ticket: any) => {
  const skEvent = ticket.dauroh?.SK || ticket.SK || ticket.EventSK; 
  
  if (!skEvent) {
      Swal.fire({
        icon: 'error',
        title: 'Error Data',
        text: 'ID Event tidak ditemukan pada riwayat ini.'
      });
      return;
  }

  const smartStatus = getSmartStatus(ticket);

  if (smartStatus === 'PENDING') {
      const checkExisting = await checkoutStore.checkExistingTransaction(skEvent);
      if (checkExisting) {
          router.push('/checkout');
      } else {
          handleExpiredFlow(skEvent);
      }
  } else if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(smartStatus)) {
      handleExpiredFlow(skEvent);
  }
};

const handleExpiredFlow = async (skEvent: string) => {
  const result = await Swal.fire({
    title: 'Pembayaran Telah Berakhir',
    text: 'Sesi pembayaran sebelumnya sudah kadaluarsa. Data peserta Anda aman! Silakan pilih metode pembayaran ulang untuk melanjutkan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Bayar Ulang',
    cancelButtonText: 'Tutup',
    reverseButtons: true
  });

  if (result.isConfirmed) {
    Swal.fire({
      title: 'Memulihkan Data...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const success = await checkoutStore.restoreTransactionData(skEvent);

    if (success) {
      Swal.close();
      router.push('/checkout'); 
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memulihkan Data',
        text: 'Maaf, terjadi kesalahan saat mengambil data peserta. Silakan coba daftar manual.',
        confirmButtonText: 'Tutup'
      });
    }
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return dayjs(dateString).format('D MMM YYYY');
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
</script>

<style scoped>
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
.fs-7 {
  font-size: 0.75rem !important;
}
.x-small {
  font-size: 0.75rem;
}
</style>