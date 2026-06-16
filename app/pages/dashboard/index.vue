<template>
  <div class="user-dashboard bg-light-subtle">
    <div class="container py-4 py-lg-5">
      <div v-if="isLoggedIn">
        <div class="row g-4">

          <div class="col-lg-12">
            
            <!-- Section Perlu Tindakan (Pending) -->
            <div v-if="pendingTickets.length > 0" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div class="card-header bg-white border-bottom-0 py-3 pb-0">
                <div class="d-flex align-items-center justify-content-between">
                  <h5 class="mb-0 fw-bold text-dark txt-subtitle">
                    <i class="bi bi-exclamation-circle me-2 text-warning"></i>Menunggu Pembayaran
                  </h5>
                </div>
              </div>

              <div class="card-body bg-white pt-3">
                <div class="row g-3">
                  <div v-for="(ticket, index) in pendingTickets" :key="'pending-' + index" class="col-md-6 col-lg-4">
                    <div class="card h-100 border rounded-4 hover-shadow transition border-warning-subtle">
                      <div class="d-flex flex-row h-100">
                        <div class="p-2">
                          <NuxtImg v-if="(ticket.Picture || ticket.picture || ticket.event?.Picture || ticket.event?.picture) && (ticket.Picture || ticket.picture || ticket.event?.Picture || ticket.event?.picture) !== 'undefined'"
                            :src="`${imgBaseUrl}/${ticket.eventSK}/${ticket.Picture || ticket.picture || ticket.event?.Picture || ticket.event?.picture}.webp`"
                            class="rounded-3 object-fit-cover shadow-sm" style="width: 100px; height: 100px;"
                            :alt="ticket.event?.Title || ticket.title" loading="lazy" />
                          <div v-else
                            class="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted"
                            style="width: 100px; height: 100px;">
                            <i class="bi bi-image display-6 opacity-50"></i>
                          </div>
                        </div>
                        <div class="p-3 ps-1 d-flex flex-column justify-content-between flex-grow-1">
                          <div>
                            <h6 class="fw-bold mb-1 text-truncate-2 txt-body">{{ ticket.event?.Title || ticket.Title }}</h6>
                            <p class="text-muted txt-caption mb-1 fw-bold">{{ formatCurrency(ticket.amount) }}</p>
                            <p class="text-danger txt-caption fw-bold mb-0" style="font-size: 0.75rem;">Sisa Waktu: {{ getRemainingTime(ticket) }}</p>
                          </div>
                          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-auto pt-2">
                            <span class="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle txt-caption fw-bold text-nowrap">
                              Belum Bayar
                            </span>
                            <button class="btn btn-primary btn-sm rounded-pill px-3 txt-caption fw-bold shadow-sm text-nowrap" @click="resumePayment(ticket)">
                              Bayar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section Tiket Aktif (Ready to use) -->
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div class="card-header bg-white border-bottom-0 py-3 pb-0">
                <div class="d-flex align-items-center justify-content-between">
                  <h5 class="mb-0 fw-bold text-dark txt-subtitle">
                    <i class="bi bi-calendar2-week me-2 text-primary"></i>Tiket Anda
                  </h5>
                </div>
              </div>

              <div class="card-body bg-white pt-3">
                <div v-if="validActiveTickets.length > 0" class="row g-3">
                  <div v-for="(ticket, index) in validActiveTickets" :key="'active-' + index" class="col-md-6 col-lg-4">
                    <div class="card h-100 border rounded-4 hover-shadow transition">
                      <div class="d-flex flex-row h-100">
                        <div class="p-2">
                          <NuxtImg v-if="(ticket.Picture || ticket.picture || ticket.event?.Picture || ticket.event?.picture) && (ticket.Picture || ticket.picture || ticket.event?.Picture || ticket.event?.picture) !== 'undefined'"
                            :src="`${imgBaseUrl}/${ticket.eventSK}/${ticket.Picture || ticket.picture || ticket.event?.Picture || ticket.event?.picture}.webp`"
                            class="rounded-3 object-fit-cover shadow-sm" style="width: 100px; height: 100px;"
                            :alt="ticket.event?.Title || ticket.title" loading="lazy" />
                          <div v-else
                            class="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted"
                            style="width: 100px; height: 100px;">
                            <i class="bi bi-image display-6 opacity-50"></i>
                          </div>
                        </div>
                        <div class="p-3 ps-1 d-flex flex-column justify-content-between flex-grow-1">
                          <div>
                            <h6 class="fw-bold mb-1 text-truncate-2 txt-body">{{ ticket.event?.Title || ticket.Title }}</h6>
                            <p class="text-muted txt-caption fw-bold mb-0"><i class="bi bi-calendar-event me-1"></i>{{ formatTicketDate(ticket.event?.Date) }}</p>
                          </div>
                          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-auto pt-2">
                            <span class="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle txt-caption fw-bold text-nowrap">
                              Siap Dipakai
                            </span>
                            <button class="btn btn-outline-primary btn-sm rounded-pill px-3 txt-caption fw-bold text-nowrap" @click="openDetailParticipant(ticket)">
                              QR Code
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="pendingTickets.length === 0 && !isLoading" class="text-center py-5">
                  <i class="bi bi-calendar-x display-4 text-light-emphasis"></i>
                  <p class="text-muted mt-3 txt-body fw-bold">Belum ada agenda kajian aktif.</p>
                </div>
                <div v-else-if="!isLoading" class="text-center py-5">
                  <p class="text-muted txt-body fw-bold">Belum ada tiket aktif.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <HistoryDetailModal 
      :show="showDetailParticipant" 
      :ticket="selectedTicket" 
      @close="closeDetailModal" 
      @show-qr="openParticipantQr" 
    />

    <ModalsQrCodeModal 
      :show="showQrModal" 
      :ticket="selectedTicketForQr" 
      :participant="selectedParticipantForQr"
      @close="closeQrModal" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { useEventStore } from '~/stores/event';
import { useCheckoutStore } from '~/stores/checkout';
import { useAuth } from '~/composables/useAuth';
import { useTransactionStatus } from '~/composables/useTransactionStatus';
import { useAlert } from '~/utils/swal';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';

useHead({ title: 'Dashboard' });

const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');
const { isLoggedIn } = useAuth();
const userStore = useUserStore();
const eventStore = useEventStore();
const checkoutStore = useCheckoutStore();
const { getSmartStatus } = useTransactionStatus();
const { alert: swalAlert, confirm: swalConfirm } = useAlert();

const isLoading = ref(true);
const showQrModal = ref(false);
const showDetailParticipant = ref(false);
const selectedTicket = ref(null);
const selectedTicketForQr = ref(null);
const selectedParticipantForQr = ref(null);
const currentTime = ref(dayjs());

let timerInterval;

onMounted(async () => {
  // Update time every minute for countdowns
  timerInterval = setInterval(() => {
    currentTime.value = dayjs();
  }, 60000);

  const forceRefresh = route.query.refresh === '1';

  if (isLoggedIn.value) {
    if (!userStore.hasFetched || forceRefresh) {
      await userStore.fetchUserTransactions();
      if (forceRefresh) {
        router.replace({ query: {} }); // Bersihkan URL biar gak fetch terus kalau di-refresh
      }
    }
  }
  
  if (eventStore.tiketEvent.length === 0) {
    await eventStore.fetchPublicTiketEvent();
  }
  isLoading.value = false;
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

// All upcoming (Pending + Successful) mapped with event data
const upcomingTickets = computed(() => {
  const allTickets = userStore.tickets || [];
  if (!Array.isArray(allTickets)) return [];

  return allTickets
    .map(item => {
      const eventSK = (item.Subject || item.SK || '').split('#')[0];
      const foundEvent = eventStore.tiketEvent.find(e => e.SK === eventSK);
      
      // Pastikan event data selengkap mungkin ngambil dari eventStore (katalog utama)
      const mergedEvent = foundEvent ? { ...item.event, ...foundEvent } : (item.event || {});
      
      return { 
        ...item,
        eventSK: eventSK,
        event: mergedEvent
      };
    })
    .filter(item => {
      const smartStatus = getSmartStatus(item);
      const rawStatus = (item.Status || item.status || '').toUpperCase();
      const isPaid = ['SUCCESSFUL', 'PAID', 'SUCCESS', 'UPCOMING', 'ACTIVE'].includes(rawStatus) || smartStatus === 'SUCCESSFUL';
      const isPending = smartStatus === 'PENDING';

      return isPaid || isPending;
    });
});

// 1. Pending Tickets
const pendingTickets = computed(() => {
  return upcomingTickets.value.filter(t => getSmartStatus(t) === 'PENDING');
});

// 2. Valid Active Tickets (Successful and Date not passed)
const validActiveTickets = computed(() => {
  return upcomingTickets.value.filter(t => {
    if (getSmartStatus(t) !== 'SUCCESSFUL') return false;
    
    // Jika event tidak ada atau Date tidak ditemukan (event inactive), sembunyikan
    if (!t.event || !t.event.Date) return false; 
    
    const dates = Object.values(t.event.Date);
    if (dates.length === 0) return false;
    
    // Find the latest day of the event
    const lastDateObj = dates.reduce((max, curr) => curr.date > max.date ? curr : max, dates[0]);
    
    let endDateTime = dayjs(lastDateObj.date).endOf('day');
    
    // Parse end_time if available
    if (lastDateObj.end_time) {
      const timeMatch = lastDateObj.end_time.match(/(\d+)\.(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        const minute = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        endDateTime = dayjs(lastDateObj.date).hour(hour).minute(minute).second(0);
      }
    }
    
    return dayjs().isBefore(endDateTime);
  });
});

const getRemainingTime = (ticket) => {
  const expiredDateStr = ticket.Expired_Date || ticket.expired_date;
  if (!expiredDateStr) return '-';
  const diffMinutes = dayjs(expiredDateStr).diff(currentTime.value, 'minute');
  if (diffMinutes <= 0) return 'Kadaluarsa';
  
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} Hari`;
  }
  
  if (hours > 0) return `${hours}j ${mins}m`;
  return `${mins} menit`;
};

const resumePayment = async (ticket) => {
  const transactionSK = ticket.SK; 

  if (!transactionSK || !transactionSK.includes('#')) {
    swalAlert('Data Tidak Lengkap', 'ID Transaksi tidak valid. Silakan hubungi admin.', 'error');
    return;
  }
  
  const smartStatus = getSmartStatus(ticket);
  
  try {
    if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(smartStatus)) {
      await handleExpiredFlow(transactionSK);
    } else {
      checkoutStore.isLoading = true;
      const isTransactionValid = await checkoutStore.checkExistingTransaction(transactionSK);
      
      if (isTransactionValid) {
        await checkoutStore.restoreTransactionData(transactionSK);
        checkoutStore.setStep('instructions'); 
        router.push('/checkout');
      } else {
        await handleExpiredFlow(transactionSK);
      }
    }
  } catch (error) {
    console.error("Gagal resume payment:", error);
    swalAlert('Kesalahan Sistem', 'Gagal memverifikasi status transaksi.', 'error');
  } finally {
    checkoutStore.isLoading = false;
  }
};

const handleExpiredFlow = async (skTransaction) => {
  const result = await swalConfirm(
    'Pembayaran Telah Berakhir',
    'Sesi pembayaran sebelumnya sudah kadaluarsa. Apakah Anda ingin membayar ulang dengan data peserta yang sama?',
    'Ya, Bayar Ulang'
  );

  if (result.isConfirmed) {
    checkoutStore.isLoading = true;
    try {
      const success = await checkoutStore.restoreTransactionData(skTransaction);
      if (success) {
        router.push('/checkout');
      } else {
        swalAlert('Gagal', 'Tidak dapat memulihkan data. Silakan mendaftar ulang.', 'error');
      }
    } catch (e) {
      swalAlert('Gagal', 'Terjadi kesalahan sistem.', 'error');
    } finally {
      checkoutStore.isLoading = false;
    }
  }
};

const openDetailParticipant = async (ticket) => {
  selectedTicket.value = ticket;
  showDetailParticipant.value = true;
  if (Array.isArray(ticket.participants)) {
    return;
  }
  const skRaw = ticket.full_sk || ticket.SK;
  const freshData = await userStore.fetchTicketDetail(skRaw);
  
  if (freshData) {
    selectedTicket.value = {
      ...selectedTicket.value,
      participants: freshData.participants.length > 0 ? freshData.participants : selectedTicket.value.participants,
      status: freshData.status || selectedTicket.value.status
    };
  }
};

const closeDetailModal = () => {
  showDetailParticipant.value = false;
  selectedTicket.value = null;
};

const openParticipantQr = (ticket, participant) => {
  selectedTicketForQr.value = ticket;
  selectedParticipantForQr.value = participant;
  
  showDetailParticipant.value = false;
  showQrModal.value = true;
};

const closeQrModal = () => {
  showQrModal.value = false;
  selectedTicketForQr.value = null; 
  selectedParticipantForQr.value = null; 
  
  showDetailParticipant.value = true; 
};

const formatCurrency = (val) => {
  if (!val || Number(val) === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(val));
};

const formatTicketDate = (dateObj) => {
  if (!dateObj) return '-';
  const dates = Object.values(dateObj);
  if (dates.length === 0) return '-';
  return dayjs(dates[0].date).format('DD MMM YYYY');
};
</script>

<style scoped>
.user-dashboard {
  min-height: calc(100vh - 70px);
  background-color: #f8f9fa;
}

.hover-shadow:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.transition {
  transition: all 0.3s ease;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rounded-4 {
  border-radius: 1rem !important;
}
</style>