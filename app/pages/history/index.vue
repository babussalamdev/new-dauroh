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
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">

      <div v-if="userStore.isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2 small">Memuat data...</p>
      </div>

      <HistoryTransactionTable 
        v-else-if="sortedTickets.length > 0" 
        :tickets="sortedTickets" 
        @open-detail="openDetailModal" 
        @resume-payment="resumePayment" 
      />

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

    <HistoryDetailModal 
      :show="showDetail" 
      :ticket="selectedTicketDetail" 
      @close="closeDetailModal" 
      @show-qr="showIndividualQr" 
    />

    <ModalsQrCodeModal :show="showQr" :ticket="qrPayload" @close="showQr = false" />
    
    </template>

<script lang="ts" setup>
import Swal from 'sweetalert2';
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

const showDetail = ref(false);
const selectedTicketDetail = ref<any>(null);
const showQr = ref(false);
const qrPayload = ref<any>(null);

onMounted(async () => {
  if (eventStore.tiketEvent.length === 0) {
    await eventStore.fetchPublicTiketEvent();
  }
  if (userStore.tickets.length === 0) {
    await userStore.fetchUserTransactions();
  }
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

// Actions Modal (Fungsi-fungsi ini tetep diem di sini!)
const openDetailModal = async (ticket: any) => {
  selectedTicketDetail.value = ticket;
  showDetail.value = true;
  try {
    const { $apiBase } = useNuxtApp();
    const skRaw = ticket.full_sk || ticket.SK;
    const res = await $apiBase.get('/get-payment', {
      params: { type: 'payment-detail', sk: skRaw }
    });
    const newData = res.data;
    if (newData && Array.isArray(newData.Participant)) {
      const freshParticipants = newData.Participant.map((p: any) => ({
        Name: p.Name || p.name,
        Gender: p.Gender || p.gender || '-',
        Age: Number(p.Age || p.age || 0),
        Domicile: p.Domicile || p.domicile || '-'
      }));
      selectedTicketDetail.value = { ...selectedTicketDetail.value, participants: freshParticipants };
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
  qrPayload.value = { event: ticket.event, participants: [specificParticipant], SK: ticket.SK };
  showQr.value = true;
};

// Payment Logic
const resumePayment = async (ticket: any) => {
  const skTransaksi = ticket.SK;
  if (!skTransaksi || !skTransaksi.includes('#')) {
    Swal.fire({ icon: 'error', title: 'Data Tidak Lengkap', text: 'ID Transaksi tidak valid (Harus ada #). Silakan hubungi admin.' });
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
      Swal.fire({ icon: 'error', title: 'Kesalahan Sistem', text: 'Gagal memverifikasi status transaksi.' });
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
    Swal.fire({ title: 'Memulihkan Data...', text: 'Mohon tunggu sebentar', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    try {
      const success = await checkoutStore.restoreTransactionData(skEvent);
      if (success) {
        Swal.close();
        router.push('/checkout');
      } else {
        throw new Error('Gagal restore data.');
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal Memulihkan Data', text: 'Terjadi kesalahan saat mengambil data peserta. Silakan coba daftar manual.', confirmButtonText: 'Tutup' });
    }
  }
};
</script>