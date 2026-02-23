<template>
  <div class="user-dashboard bg-light-subtle">
    <div class="container py-4 py-lg-5">
      <div v-if="isLoggedIn">
        <div class="row g-4">

          <div class="col-lg-12">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div class="card-header bg-white border-0 py-3">
                <div class="d-flex align-items-center justify-content-between">
                  <h5 class="mb-0 fw-bold text-dark">
                    <i class="bi bi-calendar2-week me-2 text-primary"></i>Agenda Event
                  </h5>
                </div>

                <ul class="nav nav-pills mt-3 bg-light p-1 rounded-3 d-inline-flex">
                  <li class="nav-item">
                    <button class="nav-link rounded-3 px-4 py-2" :class="{ active: activeTab === 'active' }"
                      @click="activeTab = 'active'">
                      Event Aktif
                      <span class="ms-1 badge"
                        :class="activeTab === 'active' ? 'bg-white text-primary' : 'bg-secondary text-white'">
                        {{ activeEvent.length }}
                      </span>
                    </button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link rounded-3 px-4 py-2" :class="{ active: activeTab === 'completed' }"
                      @click="activeTab = 'completed'">
                      Sudah Selesai
                    </button>
                  </li>
                </ul>
              </div>

              <div class="card-body bg-white pt-0">
                <div v-if="activeTab === 'active'">
                  <div v-if="activeEvent.length > 0" class="row g-3">
                    <div v-for="(ticket, index) in activeEvent" :key="'active-' + index" class="col-md-6 col-lg-4">
                      <div class="card h-100 border rounded-4 hover-shadow transition">
                        <div class="d-flex flex-row h-100">
                          <div class="p-2">
                            <NuxtImg v-if="ticket.event.Picture"
                              :src="`${imgBaseUrl}/${ticket.event.SK}/${ticket.event.Picture}.webp`"
                              class="rounded-3 object-fit-cover shadow-sm" style="width: 100px; height: 100px;"
                              :alt="ticket.event.Title" loading="lazy" />
                            <div v-else
                              class="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted"
                              style="width: 100px; height: 100px;">
                              <i class="bi bi-image fs-3"></i>
                            </div>
                          </div>
                          <div class="p-3 ps-1 d-flex flex-column justify-content-between flex-grow-1">
                            <div>
                              <h6 class="fw-bold mb-1 text-truncate-2 small">{{ ticket.event.Title }}</h6>
                              <p class="text-muted mb-2 small-8"><i class="bi bi-geo-alt me-1"></i>{{ ticket.event.Place
                              }}</p>
                            </div>
                            <div class="d-flex align-items-center justify-content-between mt-auto">
                              <span v-if="getSmartStatus(ticket) === 'PENDING'"
                                class="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle small-8">
                                Belum Bayar
                              </span>
                              <span v-else
                                class="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle small-8">
                                Terdaftar
                              </span>
                              <NuxtLink :to="`/event/${ticket.event.SK}`"
                                class="btn btn-link btn-sm p-0 text-decoration-none small-8 fw-bold">Detail</NuxtLink>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-5">
                    <i class="bi bi-calendar-x fs-1 text-light-emphasis"></i>
                    <p class="text-muted mt-2">Belum ada event aktif yang diikuti.</p>
                  </div>
                </div>

                <div v-else>
                  <div v-if="completedEvent.length > 0" class="row g-3">
                    <div v-for="(ticket, index) in completedEvent" :key="'comp-' + index" class="col-md-6 col-lg-4">
                      <div class="card h-100 border rounded-4 opacity-75 grayscale bg-light">
                        <div class="p-3">
                          <h6 class="fw-bold mb-1 text-truncate">{{ ticket.event.Title }}</h6>
                          <p class="text-muted mb-0 small"><i class="bi bi-check2-all me-1"></i>Selesai pada {{
                            formatDate(ticket.event.Date) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-5">
                    <p class="text-muted small">Riwayat event belum tersedia.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mt-4">
              <div class="card-header bg-white border-0 py-3">
                <h5 class="mb-0 fw-bold text-dark"><i class="bi bi-ticket-perforated me-2 text-primary"></i>Riwayat
                  Pembayaran & Tiket</h5>
              </div>
              <div class="card-body p-0">
                <div v-if="upcomingTickets.length > 0" class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                      <tr>
                        <th class="ps-4 py-3 border-0 small text-uppercase fw-bold text-muted">Transaksi</th>
                        <th class="border-0 small text-uppercase fw-bold text-muted">Detail Event</th>
                        <th class="border-0 small text-uppercase fw-bold text-muted text-center">Tiket</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(ticket, index) in upcomingTickets" :key="'row-' + index">
                        <td class="ps-4">
                          <div class="d-flex flex-column">
                            <span class="fw-bold text-primary small">#{{ ticket.SK.slice(-6).toUpperCase() }}</span>
                            <span v-if="getSmartStatus(ticket) === 'PENDING'"
                              class="text-warning small-8 fw-medium">Menunggu Verifikasi</span>
                            <span v-else class="text-success small-8 fw-medium">Pembayaran Lunas</span>
                          </div>
                        </td>
                        <td>
                          <span class="fw-bold d-block text-dark">{{ ticket.event.Title }}</span>
                          <span class="text-muted small-8">{{ ticket.participants.length }} Peserta • {{
                            formatCurrency(ticket.event.Price) }}</span>
                        </td>
                        <td class="text-center pe-4">
                          <button
                            v-if="getSmartStatus(ticket) === 'PAID' || ['SUCCESSFUL', 'SUCCESS'].includes((ticket.Status || ticket.status || '').toUpperCase())"
                            class="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm"
                            @click="openQrModal(ticket)">
                            <i class="bi bi-qr-code-scan me-2"></i>E-Ticket
                          </button>

                          <span v-else-if="getSmartStatus(ticket) === 'PENDING'"
                            class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill">
                            <i class="bi bi-hourglass-split me-1"></i>Belum Lunas
                          </span>

                          <span v-else
                            class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill">
                            Tidak Valid
                          </span>

                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-center py-5">
                  <p class="text-muted">Belum ada riwayat transaksi.</p>
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
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { useEventStore } from '~/stores/event';
import { useAuth } from '~/composables/useAuth';
import { useTransactionStatus } from '~/composables/useTransactionStatus';
import dayjs from 'dayjs';

const config = useRuntimeConfig();
const imgBaseUrl = ref(config.public.img || '');
const { isLoggedIn } = useAuth();
const userStore = useUserStore();
const eventStore = useEventStore();
const { getSmartStatus } = useTransactionStatus();
const activeTab = ref('active');

const showQrModal = ref(false);
const selectedTicket = ref(null);
const upcomingTickets = computed(() => {
  const allTickets = userStore.tickets || userStore.getDashboardData || [];
  if (!Array.isArray(allTickets)) return [];

  return allTickets.filter(item => {
    const smartStatus = getSmartStatus(item);
    const rawStatus = (item.status || '').toUpperCase();
    const isPaid = smartStatus === 'SUCCESSFUL' || rawStatus === 'SUCCESSFUL';
    const isPending = smartStatus === 'PENDING';

    return isPaid || isPending;
  });
});
onMounted(async () => {
  if (isLoggedIn.value) {
    await userStore.fetchUserTransactions();
  }
  if (eventStore.tiketEvent.length === 0) {
    await eventStore.fetchPublicTiketEvent();
  }
});

// Filter Event Aktif vs Selesai
const activeEvent = computed(() => {
  return upcomingTickets.value.filter(t => {
    if (!t.event.Date) return true;
    const dates = Object.values(t.event.Date);
    if (dates.length === 0) return true;
    const lastDate = dates.reduce((max, curr) => curr.date > max ? curr.date : max, dates[0].date);
    return dayjs().isBefore(dayjs(lastDate).add(1, 'day'));
  });
});

const completedEvent = computed(() => {
  return upcomingTickets.value.filter(t => {
    if (!t.event.Date) return false;
    const dates = Object.values(t.event.Date);
    if (dates.length === 0) return false;
    const lastDate = dates.reduce((max, curr) => curr.date > max ? curr.date : max, dates[0].date);
    return dayjs().isAfter(dayjs(lastDate).add(1, 'day'));
  });
});

const openQrModal = (ticket) => {
  selectedTicket.value = ticket;
  showQrModal.value = true;
};

const closeQrModal = () => {
  showQrModal.value = false;
  selectedTicket.value = null;
};

const formatCurrency = (val) => {
  if (!val || Number(val) === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(val));
};

const formatDate = (dateObj) => {
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

.nav-pills .nav-link {
  color: #6c757d;
  font-weight: 500;
  font-size: 0.9rem;
}

.nav-pills .nav-link.active {
  background-color: #ffffff;
  color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* Vendor prefix */
  line-clamp: 2;
  /* Standard property (Saran Audit) */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.small-8 {
  font-size: 0.8rem;
}

.grayscale {
  filter: grayscale(1);
}

.table thead th {
  letter-spacing: 0.5px;
}

/* Custom shadow & border radius for cards */
.rounded-4 {
  border-radius: 1rem !important;
}
</style>