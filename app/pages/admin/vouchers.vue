<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">Manajemen Voucher</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center gap-3 w-100 w-md-auto">
          <h5 class="mb-0 fw-bold text-dark"><i class="bi bi-ticket-perforated-fill text-primary me-2"></i>Vouchers</h5>
          
          <select class="form-select form-select-sm bg-light border-0 shadow-sm" style="width: 250px;"
            v-model="store.selectedEventSK" @change="handleEventChange">
            <option value="" disabled>-- Pilih Event Dahulu --</option>
            <option v-for="event in store.events" :key="event.SK" :value="event.SK">
              {{ event.Title }}
            </option>
          </select>
        </div>

        <div class="d-flex gap-2 w-100 w-md-auto justify-content-end" v-if="store.selectedEventSK">
          <button v-if="selectedIds.length > 0" class="btn btn-danger btn-sm rounded-pill px-3 shadow-sm" @click="handleBulkDelete">
            <i class="bi bi-trash3-fill me-1"></i> Hapus ({{ selectedIds.length }})
          </button>
          
          <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm" @click="showModal = true" :disabled="store.loading">
            <i class="bi bi-plus-lg me-1"></i> Tambah Voucher
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="!store.selectedEventSK" class="text-center py-5 text-muted bg-light border-bottom border-top">
          <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-primary opacity-50"></i>
          <p class="mb-0 fw-medium">Silakan pilih <strong>Event</strong> untuk mengelola voucher.</p>
        </div>

        <div v-else>
          <CommonLoadingSpinner v-if="store.loading && store.voucher.length === 0" class="my-5" />

          <div v-else-if="store.voucher.length > 0">
            <div class="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
               <div class="small text-muted">
                 Menampilkan <strong>{{ store.paginatedData.length }}</strong> data.
               </div>
               <div class="input-group input-group-sm shadow-sm" style="max-width: 300px;">
                  <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control bg-light border-0" placeholder="Cari kode..." v-model="store.search" @input="store.changePage(1)">
               </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th class="ps-4" style="width: 40px;">
                      <input type="checkbox" class="form-check-input" :checked="isAllSelected" @change="toggleSelectAll">
                    </th>
                    <th>VOUCHER CODE</th>
                    <th class="text-center">STATUS</th>
                    <th>EXPIRED</th>
                    <th>DISKON</th>
                    <th>USER</th>
                    <th class="text-center pe-4" style="width: 100px;">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in store.paginatedData" :key="v.SK">
                    <td class="ps-4">
                      <input type="checkbox" class="form-check-input" :value="v.SK" v-model="selectedIds">
                    </td>
                    <td class="fw-bold text-dark">{{ v.SK }}</td>
                    <td class="text-center">
                      <span :class="['badge rounded-pill px-2', v.Status === 'active' ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-secondary bg-opacity-10 text-muted border']" style="font-size: 0.75rem;">
                        {{ v.Status }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ v.Expired }}</td>
                    <td class="fw-medium text-dark">Rp{{ formatCurrency(v.Nominal) }}</td>
                    <td class="small">{{ v.User || '-' }}</td>
                    <td class="text-center pe-4">
                      <button class="btn btn-sm text-danger p-0 border-0 bg-transparent shadow-none" 
    title="Hapus" @click="handleSingleDelete(v.SK)">
    <i class="bi bi-trash fs-5"></i>
  </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="card-footer bg-white border-top d-flex justify-content-between align-items-center p-3 px-4">
              <span class="text-muted small">Total: {{ store.totalItems }} Voucher</span>
              <div class="btn-group shadow-sm">
                <button class="btn btn-outline-secondary btn-sm px-3" :disabled="store.currentPage === 1" @click="store.changePage(store.currentPage - 1)">
                  Prev
                </button>
                <button class="btn btn-outline-secondary btn-sm px-3" :disabled="store.currentPage === store.totalPages" @click="store.changePage(store.currentPage + 1)">
                  Next
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-5">
            <i class="bi bi-ticket-perforated fs-1 text-muted opacity-50 mb-3 d-block"></i>
            <h6 class="fw-bold">Belum Ada Voucher</h6>
            <p class="text-muted small">Event ini belum memiliki voucher terdaftar.</p>
          </div>
        </div>
      </div>
    </div>

    <AdminEventVoucherFormModal :show="showModal" @close="showModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useVoucherStore } from '~/stores/voucher';
import Swal from 'sweetalert2';

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/');
  }
});

const store = useVoucherStore();
const showModal = ref(false);
const selectedIds = ref<string[]>([]); // Menyimpan ID voucher yang dicentang

// --- Logic Selection ---
const isAllSelected = computed(() => {
  return store.paginatedData.length > 0 && selectedIds.value.length === store.paginatedData.length;
});

const toggleSelectAll = (e: any) => {
  if (e.target.checked) {
    selectedIds.value = store.paginatedData.map(v => v.SK);
  } else {
    selectedIds.value = [];
  }
};

const handleEventChange = () => {
  selectedIds.value = []; // Reset pilihan saat ganti event
  store.fetchVouchers();
};

// --- Action Handlers ---
const handleSingleDelete = async (id: string) => {
  const result = await Swal.fire({
    title: 'Hapus Voucher?',
    text: "Data yang dihapus tidak bisa dikembalikan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Ya, Hapus'
  });

  if (result.isConfirmed) {
    await store.deleteVoucher(id); // Pastikan action ini manggil API BE
  }
};

const handleBulkDelete = async () => {
  const result = await Swal.fire({
    title: `Hapus ${selectedIds.value.length} Voucher?`,
    text: "Semua voucher yang dipilih akan dihapus permanen.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Ya, Hapus Semua'
  });

  if (result.isConfirmed) {
    // Di sini lu manggil action store buat bulk delete
    // await store.deleteVoucherBulk(selectedIds.value);
    Swal.fire('Fitur Sedang Disiapkan', 'Pastikan API Bulk Delete di Backend sudah ada.', 'info');
    selectedIds.value = [];
  }
};

// Init
await useAsyncData('voucher-events-init', async () => {
  await store.fetchEvents();
  store.selectedEventSK = '';
  store.voucher = [];
  return true;
});

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID').format(val);
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
</style>