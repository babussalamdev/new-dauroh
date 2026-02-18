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
              <th scope="col" class="ps-4 py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Tanggal & ID</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Event Info</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Peserta</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Status</th>
              <th scope="col" class="py-3 text-uppercase text-secondary fs-7 fw-semibold text-center">Total</th>
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
                <div class="d-flex flex-column align-items-center gap-1">
                  <template v-if="getSmartStatus(ticket) === 'SUCCESSFUL'">
                    <span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1 small-7">
                      <i class="bi bi-check-circle-fill me-1"></i>Lunas
                    </span>
                  </template>

                  <template v-else-if="['CANCELLED', 'EXPIRED', 'FAILED'].includes(getSmartStatus(ticket))">
                    <span class="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 small-7">
                      <i class="bi bi-x-circle-fill me-1"></i>Kadaluarsa
                    </span>
                  </template>

                  <template v-else-if="getSmartStatus(ticket) === 'PENDING'">
                    <span class="badge rounded-pill bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 small-7 mb-1">
                      <i class="bi bi-hourglass-split me-1"></i>Menunggu
                    </span>
                    <span class="text-muted fw-light" style="font-size: 0.65rem;">
                      Hingga: {{ formatTime(ticket.Expired_Date || ticket.expired_date) }}
                    </span>
                  </template>
                </div>
              </td>

              <td class="py-3 text-center">
                <span class="fw-bold text-dark fs-6">
                  {{ formatCurrency(ticket.amount || 0) }}
                </span>
              </td>

              <td class="pe-4 py-3 text-center">
                <div class="d-flex flex-column gap-2 mx-auto" style="max-width: 120px;">
                  
                  <button 
                    @click="openDetailModal(ticket)" 
                    class="btn btn-xs btn-outline-secondary border shadow-sm py-1 px-2 d-flex align-items-center justify-content-center gap-1"
                    style="font-size: 0.75rem;"
                  >
                    <i class="bi bi-eye"></i> Detail
                  </button>

                  <button 
                    v-if="['EXPIRED', 'CANCELLED', 'FAILED'].includes(getSmartStatus(ticket))"
                    class="btn btn-xs btn-danger text-white py-1 px-2 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                    style="font-size: 0.75rem;"
                    @click="resumePayment(ticket)"
                  >
                    <i class="bi bi-arrow-clockwise"></i> Re-Pay
                  </button>

                  <button 
                    v-else-if="getSmartStatus(ticket) === 'PENDING'"
                    class="btn btn-xs btn-primary text-white py-1 px-2 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                    style="font-size: 0.75rem;"
                    @click="resumePayment(ticket)"
                  >
                    <i class="bi bi-credit-card"></i> Bayar
                  </button>

                  <span 
                    v-else-if="getSmartStatus(ticket) === 'SUCCESSFUL'"
                    class="text-success fw-bold p-1"
                    style="font-size: 0.7rem;"
                  >
                    <i class="bi bi-patch-check"></i> SUCCESS
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

    <div v-if="showDetail" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" tabindex="-1" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Detail Peserta</h5>
            <button type="button" class="btn-close" @click="closeDetailModal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <div v-if="selectedTicketDetail" class="mb-3">
              <h6 class="text-primary fw-bold mb-1">{{ selectedTicketDetail.Title || selectedTicketDetail.title || selectedTicketDetail.dauroh?.Title }}</h6>
              <small class="text-muted">ID: {{ selectedTicketDetail.SK }}</small>
            </div>

            <div class="card bg-light border-0 rounded-3 overflow-hidden" v-if="selectedTicketDetail">
              <table class="table table-sm table-borderless align-middle mb-0">
                <thead class="border-bottom">
                  <tr class="text-secondary small">
                    <th class="ps-3 py-2">Nama Peserta</th>
                    <th class="text-end pe-3">Tiket</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, idx) in selectedTicketDetail.participants" :key="idx">
                    <td class="ps-3 py-2">
                      <div class="fw-bold text-dark">{{ p.Name }}</div>
                      <small class="text-muted" style="font-size: 0.75rem;">{{ p.Gender || 'Umum' }}</small>
                    </td>
                    <td class="text-end pe-3">
                      <button 
                        v-if="getSmartStatus(selectedTicketDetail) === 'SUCCESSFUL'"
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
            
            <div v-if="selectedTicketDetail && getSmartStatus(selectedTicketDetail) !== 'SUCCESSFUL'" class="alert alert-warning d-flex align-items-center mt-3 mb-0 p-2 small">
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
import { useAuth } from '~/composables/useAuth'; // Pastikan diimport karena dipake di middleware
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

// State
const showDetail = ref(false);
const selectedTicketDetail = ref<any>(null);
const showQr = ref(false);
const qrPayload = ref<any>(null);

onMounted(async () => {
  if (daurohStore.tiketDauroh.length === 0) {
      await daurohStore.fetchPublicTiketDauroh();
  }
  await userStore.fetchUserTransactions();
});

// Computed Properties
const sortedTickets = computed(() => {
  if (!userStore.tickets || !Array.isArray(userStore.tickets)) return [];
  
  // Clone array to avoid mutating state directly during sort
  return [...userStore.tickets].sort((a, b) => {
    const dateA = new Date(a.CreatedAt || a.created_at || a.date || 0).getTime();
    const dateB = new Date(b.CreatedAt || b.created_at || b.date || 0).getTime();
    return dateB - dateA;
  });
});

// Formatters
const formatTime = (dateString: string) => {
  if (!dateString || dateString === '-') return '-';
  // Replace spasi dengan T untuk format ISO 8601
  return dayjs(dateString.replace(' ', 'T')).format('DD MMM • HH:mm');
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return dayjs(dateString).format('D MMM YYYY');
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
const calculateRealTotal = (ticket: any) => {
  // 1. Ambil Jumlah Peserta (Kalau array kosong, anggap 1)
  const count = ticket.participants?.length || 1;

  // 2. Tentukan Harga Satuan
  // Prioritas A: Ambil dari Master Data (Dauroh Store) biar akurat
  const eventId = (ticket.SK || '').split('#')[0];
  const masterEvent = daurohStore.tiketDauroh.find((e: any) => e.SK === eventId);
  
  let unitPrice = 0;
  
  if (masterEvent) {
     unitPrice = Number(masterEvent.Price);
  } else {
     // Prioritas B: Kalau master ga ada, pake harga yang nempel di tiket
     // Kita asumsikan ticket.amount yg skrg tampil salah itu adalah harga satuan
     unitPrice = Number(ticket.dauroh?.Price || ticket.amount || 0);
  }

  // 3. Total = Harga Satuan x Jumlah Orang
  return unitPrice * count;
};

// Actions Modal
const openDetailModal = async (ticket: any) => {
  selectedTicketDetail.value = ticket;
  showDetail.value = true;
  try {
     const { $apiBase } = useNuxtApp();
     const skRaw = ticket.full_sk || ticket.SK; 
     const res = await $apiBase.get('/get-payment', {
        params: {
           type: 'payment-detail', 
           sk: skRaw               
        }
     });
     const newData = res.data;
     if (newData && Array.isArray(newData.Participant)) {
         const freshParticipants = newData.Participant.map((p: any) => ({
             Name: p.Name || p.name,
             Gender: p.Gender || p.gender || '-',
             Age: Number(p.Age || p.age || 0),
             Domicile: p.Domicile || p.domicile || '-'
         }));
         selectedTicketDetail.value = {
            ...selectedTicketDetail.value,
            participants: freshParticipants
         };
     }

  } catch (error) {
     console.error("Gagal update detail:", error);
  }
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

// Payment Logic
const resumePayment = async (ticket: any) => {
  // [FIX] Pake full_sk atau SK yang ada pagarnya (#), JANGAN ID EVENT DOANG
  const skTransaksi = ticket.full_sk || ticket.SK; 

  console.log("🚀 Resume Payment SK:", skTransaksi); // Debugging
  
  if (!skTransaksi || !skTransaksi.includes('#')) {
      Swal.fire({
        icon: 'error',
        title: 'Data Tidak Lengkap',
        text: 'ID Transaksi tidak valid (Harus ada #). Silakan hubungi admin.'
      });
      return;
  }

  const smartStatus = getSmartStatus(ticket);

  // LOGIC BAYAR / RE-PAY
  if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(smartStatus)) {
      // Pass SK Transaksi Lengkap ke fungsi expired
      await handleExpiredFlow(skTransaksi);
  } 
  else if (smartStatus === 'PENDING') {
      try {
        // Cek pakai SK Transaksi
        const isTransactionValid = await checkoutStore.checkExistingTransaction(skTransaksi);
        
        if (isTransactionValid) {
           router.push('/checkout');
        } else {
           await handleExpiredFlow(skTransaksi);
        }
      } catch (error) {
         console.error("Gagal cek transaksi:", error);
         Swal.fire({icon: 'error', title: 'Kesalahan Sistem', text: 'Gagal memverifikasi status transaksi.'});
      }
  }
};

const handleExpiredFlow = async (skEvent: string) => {
  const result = await Swal.fire({
    title: 'Pembayaran Telah Berakhir',
    text: 'Sesi pembayaran sebelumnya sudah kadaluarsa. Apakah Anda ingin membayar ulang dengan data peserta yang sama?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Bayar Ulang',
    cancelButtonText: 'Batal',
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

    try {
        const success = await checkoutStore.restoreTransactionData(skEvent);

        if (success) {
          Swal.close();
          router.push('/checkout'); 
        } else {
          // Error handling sudah di-handle di dalam restoreTransactionData biasanya,
          // tapi fallback di sini tetap perlu
          throw new Error('Gagal restore data.'); 
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Memulihkan Data',
            text: 'Terjadi kesalahan saat mengambil data peserta. Silakan coba daftar manual.',
            confirmButtonText: 'Tutup'
        });
    }
  }
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