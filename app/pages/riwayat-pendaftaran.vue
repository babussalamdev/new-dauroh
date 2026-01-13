<template>
  <div class="container py-5">
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0 fw-bold"><i class="bi bi-clock-history me-2 text-primary"></i>Riwayat Pendaftaran Lengkap</h5>
      </div>
      <div class="card-body">
        
        <div v-if="allTickets.length > 0" class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Tanggal</th>
                <th>Event</th>
                <th>Peserta</th>
                <th>Status</th>
                <th class="text-center">Total</th>
                <th class="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ticket, index) in allTickets" :key="index">
                <td>
                  <small class="text-muted d-block">{{ formatDate(ticket.created_at || ticket.date) }}</small>
                  <small class="fw-bold text-primary">{{ ticket.SK || ticket.id }}</small>
                </td>

                <td>
                  <span class="fw-bold">{{ ticket.dauroh?.Title || ticket.title || 'Event Dauroh' }}</span><br>
                  <small class="text-muted">{{ ticket.dauroh?.Place || '-' }}</small>
                </td>

                <td>
                  <div v-if="Array.isArray(ticket.participants)">
                      <div v-for="p in ticket.participants" :key="p.Name" class="small">
                        • {{ p.Name }}
                      </div>
                  </div>
                  <div v-else class="small text-muted">
                      {{ ticket.total_participants || 1 }} Peserta
                  </div>
                </td>

                <td>
                  <span 
                    class="badge rounded-pill"
                    :class="getStatusClass(ticket.status)"
                  >
                    {{ ticket.status }}
                  </span>
                </td>

                <td class="text-center fw-bold">
                   {{ formatCurrency(ticket.amount || (ticket.dauroh?.Price * (ticket.participants?.length || 1))) }}
                </td>

                <td class="text-end">
                    <div v-if="ticket.status === 'PENDING'" class="d-flex justify-content-end gap-1">
                        <button 
                            @click="cancelBooking(ticket)" 
                            class="btn btn-sm btn-outline-danger" 
                            title="Batalkan Pendaftaran"
                            :disabled="isLoading"
                        >
                            <i class="bi bi-x-lg"></i>
                        </button>
                        <button 
                            @click="resumePayment(ticket)" 
                            class="btn btn-sm btn-primary" 
                            title="Lanjut Bayar"
                        >
                            Bayar
                        </button>
                    </div>
                    <div v-else-if="ticket.status === 'PAID' || ticket.status === 'Upcoming'">
                        <small class="text-success"><i class="bi bi-check-circle-fill"></i> Terdaftar</small>
                    </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          <p>Belum ada riwayat pendaftaran.</p>
          <NuxtLink to="/" class="btn btn-primary rounded-pill mt-2">Daftar Event Sekarang</NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { useCheckoutStore } from '~/stores/checkout'; // Import Checkout Store
import Swal from 'sweetalert2';

useHead({ title: 'Riwayat Pendaftaran' });

definePageMeta({
  middleware: (to, from) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) return navigateTo('/login');
  }
});

const userStore = useUserStore();
const checkoutStore = useCheckoutStore(); // Init Checkout Store
const { $api } = useNuxtApp() as any; 
const isLoading = ref(false);

// Pastikan ambil data terbaru saat halaman dibuka
onMounted(() => {
    // Asumsi di userStore ada action fetchTickets, panggil disini biar data fresh
    // userStore.fetchTickets(); 
});

const allTickets = computed(() => userStore.getAllTickets);

// --- LOGIC BARU: Resume Payment ---
const resumePayment = (ticket: any) => {
    // 1. Masukkan data history ke store checkout
    checkoutStore.transactionDetails = {
        ...ticket,
        vaNumber: ticket.receiver_bank_account?.account_number || ticket.va_number, 
        expiryTime: ticket.expired_date,
        paymentMethod: ticket.sender_bank || 'Bank',
        status: ticket.status
    };

    // 2. Redirect ke halaman instruksi
    navigateTo('/checkout/instructions');
};

// --- LOGIC BARU: Cancel Booking ---
const cancelBooking = async (ticket: any) => {
    const result = await Swal.fire({
        title: 'Batalkan Pendaftaran?',
        text: "Kuota akan dikembalikan dan Anda bisa mendaftar ulang.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Tidak'
    });

    if (result.isConfirmed) {
        isLoading.value = true;
        try {
            // Panggil API Delete (Sesuaikan endpoint backend kamu)
            // Biasanya endpointnya: DELETE /transaction/{SK atau ID}
            await $api.delete(`/transaction/${ticket.SK || ticket.id}`);
            
            Swal.fire('Berhasil!', 'Pendaftaran dibatalkan.', 'success');
            
            // Refresh data store agar baris hilang/update
            // window.location.reload(); // Cara kasar refresh
            // Atau panggil action store jika ada: userStore.fetchTickets();
            
            // Hapus manual dari list sementara (biar ga perlu reload page)
            // userStore.removeTicket(ticket.SK); 
             
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat membatalkan.', 'error');
        } finally {
            isLoading.value = false;
        }
    }
};

// --- Helpers ---
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (val: number) => {
  if (!val) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

// Helper warna badge
const getStatusClass = (status: string) => {
    if (!status) return 'bg-secondary';
    switch (status.toUpperCase()) {
        case 'UPCOMING':
        case 'PAID':
        case 'ACTIVE':
            return 'bg-success';
        case 'PENDING':
            return 'bg-warning text-dark'; // Kuning biar kelihatan Warning
        case 'EXPIRED':
        case 'FAILED':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
};
</script>

<style scoped>
@import url("~/assets/css/admin/tables.css");
</style>