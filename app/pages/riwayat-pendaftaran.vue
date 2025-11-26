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
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ticket, index) in allTickets" :key="index">
                <td>
                  <small class="text-muted d-block">{{ formatDate(ticket.date) }}</small>
                  <small class="fw-bold text-primary">{{ ticket.SK }}</small>
                </td>
                <td>
                  <span class="fw-bold">{{ ticket.dauroh.Title }}</span><br>
                  <small class="text-muted">{{ ticket.dauroh.Place }}</small>
                </td>
                <td>
                  <div v-for="p in ticket.participants" :key="p.name" class="small">
                    • {{ p.name }}
                  </div>
                </td>
                <td>
                  <span 
                    class="badge rounded-pill"
                    :class="ticket.status === 'Upcoming' ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="text-center fw-bold">
                   {{ formatCurrency(ticket.dauroh.Price * ticket.participants.length) }}
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
import { computed } from 'vue';
import { useUserStore } from '~/stores/user';

useHead({ title: 'Riwayat Pendaftaran' });

// Middleware auth (pastikan user login)
definePageMeta({
  middleware: (to, from) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn.value) return navigateTo('/login');
  }
});

const userStore = useUserStore();
const allTickets = computed(() => userStore.getAllTickets);

// Helper Formatter
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

const formatCurrency = (val: number) => {
  if (!val) return 'Gratis';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};
</script>
<style scoped>
@import url("~/assets/css/admin/tables.css");
</style>