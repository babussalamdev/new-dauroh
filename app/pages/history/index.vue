<template>
  <div class="container py-5">
    
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h3 class="txt-title fw-bold text-dark m-0"><i class="bi bi-clock-history me-2 text-primary"></i>Riwayat Pendaftaran</h3>
      </div>
      <div v-if="sortedTickets.length > 0">
        <span class="badge bg-white text-secondary border shadow-sm rounded-pill px-3 py-2 txt-caption fw-bold">
          <i class="bi bi-receipt me-1"></i> {{ sortedTickets.length }} Transaksi
        </span>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">

      <div v-if="userStore.isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2 txt-caption fw-bold">Memuat data...</p>
      </div>

      <HistoryTransactionTable 
        v-else-if="sortedTickets.length > 0" 
        :tickets="sortedTickets" 
        @open-detail="openDetailModal" 
        @resume-payment="resumePayment" 
      />

      <div v-else class="text-center py-5">
        <div class="bg-light rounded-circle d-inline-flex p-4 mb-3">
          <i class="bi bi-inbox text-secondary display-4 opacity-50"></i>
        </div>
        <h5 class="txt-subtitle fw-bold text-dark">Belum ada riwayat</h5>
        <p class="text-muted mb-4 txt-body">Anda belum mendaftar di event manapun.</p>
        <NuxtLink to="/" class="btn btn-primary rounded-pill px-4 py-2 shadow-sm txt-body fw-bold">
          <i class="bi bi-search me-2"></i>Cari Kajian
        </NuxtLink>
      </div>

    </div>

    <HistoryDetailModal 
      :show="showDetail" 
      :ticket="selectedTicketDetail" 
      @close="closeDetailModal" 
      @show-qr="showIndividualQr" 
    />

    <ModalsQrCodeModal 
      :show="showQr" 
      :ticket="selectedTicketForQr" 
      :participant="selectedParticipantForQr"
      @close="closeQrModal" 
    />
    
  </div>
</template>

<script lang="ts" setup>
import { useAlert } from '~/utils/swal';
import {computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '~/stores/user';
import { useCheckoutStore } from '~/stores/checkout';
import { useEventStore } from '~/stores/event';
import { useTransactionStatus } from '~/composables/useTransactionStatus';
import { useAuth } from '~/composables/useAuth';

useHead({ title: 'Riwayat Pendaftaran' });

definePageMeta({
  middleware: (to, from) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) return navigateTo('/auth/login');
  }
});

const router = useRouter();
const userStore = useUserStore();
const checkoutStore = useCheckoutStore();
const eventStore = useEventStore();
const { getSmartStatus } = useTransactionStatus();
const { alert: swalAlert, confirm: swalConfirm } = useAlert();

const showDetail = ref(false);
const selectedTicketDetail = ref<any>(null);
const showQr = ref(false);
const selectedTicketForQr = ref<any>(null);
const selectedParticipantForQr = ref<any>(null);

onMounted(async () => {
  if (eventStore.tiketEvent.length === 0) {
    await eventStore.fetchPublicTiketEvent();
  }
  await userStore.fetchUserTransactions();
});

// Computed Properties
const sortedTickets = computed(() => {
  if (!userStore.tickets || !Array.isArray(userStore.tickets)) return [];
  return [...userStore.tickets].sort((a, b) => {
    const dateA = new Date(a.CreatedAt || a.created_at || a.date || 0).getTime();
    const dateB = new Date(b.CreatedAt || b.created_at || b.date || 0).getTime();
    return dateB - dateA;
  });
});

// Actions Modal
const openDetailModal = async (ticket: any) => {
  selectedTicketDetail.value = ticket;
  showDetail.value = true;
  const skRaw = ticket.full_sk || ticket.SK;
  const freshData = await userStore.fetchTicketDetail(skRaw);
  
  if (freshData) {
    selectedTicketDetail.value = { 
      ...selectedTicketDetail.value, 
      participants: freshData.participants.length > 0 ? freshData.participants : selectedTicketDetail.value?.participants,
      status: freshData.status || selectedTicketDetail.value?.status
    };
  }
};

const closeDetailModal = () => {
  showDetail.value = false;
  selectedTicketDetail.value = null;
};

const showIndividualQr = (ticket: any, specificParticipant: any) => {
  selectedTicketForQr.value = ticket;
  selectedParticipantForQr.value = specificParticipant;
  
  showDetail.value = false;
  showQr.value = true;
};

const closeQrModal = () => {
  showQr.value = false;
  selectedTicketForQr.value = null;
  selectedParticipantForQr.value = null;
  
  showDetail.value = true;
};

// Payment Logic
const resumePayment = async (ticket: any) => {
  const skTransaksi = ticket.SK;
  if (!skTransaksi || !skTransaksi.includes('#')) {
    swalAlert('Data Tidak Lengkap', 'ID Transaksi tidak valid. Silakan hubungi admin.', 'error');
    return;
  }
  
  const smartStatus = getSmartStatus(ticket);
  if (['EXPIRED', 'CANCELLED'].includes(smartStatus)) {
    await handleExpiredFlow(skTransaksi);
  } else {
    try {
      const isTransactionValid = await checkoutStore.checkExistingTransaction(skTransaksi);
      if (isTransactionValid) {
        router.push('/checkout');
      } else {
        await handleExpiredFlow(skTransaksi);
      }
    } catch (error) {
      console.error("Gagal cek transaksi:", error);
      swalAlert('Kesalahan Sistem', 'Gagal memverifikasi status transaksi.', 'error');
    }
  }
};

const handleExpiredFlow = async (skEvent: string) => {
  const result = await swalConfirm(
    'Pembayaran Telah Berakhir',
    'Sesi pembayaran sebelumnya sudah kadaluarsa. Apakah Anda ingin membayar ulang dengan data peserta yang sama?',
    'Ya, Bayar Ulang'
  );

  if (result.isConfirmed) {
    const { $swal } = useNuxtApp() as any;
    $swal.fire({ 
      title: 'Memulihkan Data...', 
      text: 'Mohon tunggu sebentar', 
      allowOutsideClick: false, 
      didOpen: () => { $swal.showLoading(); } 
    });

    try {
      const success = await checkoutStore.restoreTransactionData(skEvent);
      if (success) {
        $swal.close();
        router.push('/checkout');
      } else {
        throw new Error('Gagal restore data.');
      }
    } catch (error) {
      $swal.close();
      swalAlert('Gagal', 'Terjadi kesalahan saat memulihkan data peserta.', 'error');
    }
  }
};
</script>