<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption fw-bold text-primary">
            <i class="bi bi-house-door-fill me-1"></i>Home
          </NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-medium txt-caption text-dark" aria-current="page">Manajemen Voucher</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        
        <div class="d-flex align-items-center gap-3 flex-grow-1" style="min-width: 0;">
          
          <div class="d-flex flex-column align-items-start gap-1 w-100" style="min-width: 0;">
            <h6 class="mb-0 fw-bold txt-subtitle text-dark text-truncate w-100">Vouchers</h6>
            
            <span v-if="globalStore.activeEventSK" class="text-primary fw-medium txt-caption text-truncate w-100">
              {{ globalStore.activeEvent?.Title }}
            </span>
            <span v-else class="text-muted txt-caption text-truncate w-100">
              Belum Ada Event Terpilih
            </span>
          </div>
        </div>

        <div class="d-flex gap-2 flex-shrink-0 flex-wrap" v-if="globalStore.activeEventSK">
          
          <button v-if="selectedIds.length > 0" class="btn btn-danger rounded-pill px-3 py-1 shadow-sm txt-caption fw-medium d-flex align-items-center" @click="handleBulkDelete">
            <i style="font-size: 0.8rem;"></i> Hapus ({{ selectedIds.length }})
          </button>
          
          <button class="btn btn-primary rounded-pill px-3 py-1 shadow-sm txt-caption fw-medium d-flex align-items-center" @click="showModal = true" :disabled="store.loading">
            <i style="font-size: 0.8rem;"></i> Tambah Voucher
          </button>
        </div>
        
      </div>

      <div class="card-body p-0">
        
        <div v-if="!globalStore.activeEventSK" class="text-center py-5 text-muted bg-light border-bottom border-top">
          <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-primary opacity-50"></i>
          <p class="mb-0 fw-medium txt-body">Silakan pilih <strong>Event</strong> di halaman Dashboard untuk mengelola voucher.</p>
          <NuxtLink to="/admin" class="btn btn-sm btn-primary mt-3 rounded-pill px-4 shadow-sm">Ke Dashboard</NuxtLink>
        </div>

        <div v-else>
          <CommonLoadingSpinner v-if="store.loading && store.voucher.length === 0" class="my-5" />

          <div v-else-if="store.paginatedData.length > 0">
            <div class="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
               <div class="input-group input-group-sm shadow-sm" style="max-width: 300px;">
                  <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" class="form-control bg-light border-0 txt-body" placeholder="Cari kode..." v-model="store.search" @input="store.changePage(1)">
               </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th class="ps-4" style="width: 40px;">
                      <input type="checkbox" class="form-check-input" :checked="isAllSelected" @change="toggleSelectAll">
                    </th>
                    <th class="txt-label">VOUCHER CODE</th>
                    <th class="text-center txt-label">STATUS</th>
                    <th class="txt-label">EXPIRED</th>
                    <th class="txt-label">DISKON</th>
                    <th class="txt-label">USER</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in store.paginatedData" :key="v.SK">
                    <td class="ps-4">
                      <input type="checkbox" class="form-check-input" :value="v.SK" v-model="selectedIds">
                    </td>
                    <td class="fw-bold text-dark txt-body">{{ v.SK }}</td>
                    
                    <td class="text-center">
                      <span :class="['badge rounded-pill px-3 py-1 shadow-sm txt-label', v.Status === 'active' ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-secondary bg-opacity-10 text-muted border']">
                        {{ v.Status }}
                      </span>
                    </td>
                    
                    <td class="txt-caption" :class="isExpired(v.Expired) ? 'text-danger fw-bold' : 'text-muted'">
                      {{ v.Expired }}
                    </td>
                    <td class="fw-medium text-dark txt-body">Rp{{ formatCurrency(v.Nominal) }}</td>
                    <td class="txt-caption text-muted">{{ v.Username || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="card-footer bg-white border-top d-flex justify-content-between align-items-center p-3 px-4">
              <span class="text-muted txt-caption">Total: {{ store.totalItems }} Voucher</span>
              <div class="btn-group shadow-sm">
                <button class="btn btn-outline-secondary btn-sm px-3 txt-body" :disabled="store.currentPage === 1" @click="store.changePage(store.currentPage - 1)">
                  Prev
                </button>
                <button class="btn btn-outline-secondary btn-sm px-3 txt-body" :disabled="store.currentPage === store.totalPages" @click="store.changePage(store.currentPage + 1)">
                  Next
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-5">
            <i class="bi bi-ticket-perforated fs-1 text-muted opacity-50 mb-3 d-block"></i>
            <h6 class="txt-subtitle mb-1">Belum Ada Voucher</h6>
            <p class="text-muted txt-body">Event ini belum memiliki voucher terdaftar.</p>
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
import { useGlobalEventStore } from '~/stores/globalEvent';
import { useAlert } from '~/utils/swal';

useHead({
  title: 'Manajemen Voucher'
});

definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) return navigateTo('/');
  }
});

const store = useVoucherStore();
const globalStore = useGlobalEventStore();
const { alert: swalAlert, confirm: swalConfirm } = useAlert(); 

const showModal = ref(false);
const selectedIds = ref<string[]>([]);

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

// --- HANDLE BULK DELETE ---
const handleBulkDelete = async () => {
  // swalConfirm
  const result = await swalConfirm(
    `Hapus ${selectedIds.value.length} Voucher?`,
    "Voucher yang dipilih akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.",
    'Ya, Hapus Semua'
  );

  if (result.isConfirmed) {
    const success = await store.deleteVoucherBulk(selectedIds.value);

    if (success) {
      selectedIds.value = [];
      // feedback sukses
      swalAlert('Berhasil!', 'Voucher yang dipilih telah dihapus.', 'success');
    } else {
      swalAlert('Gagal', 'Terjadi kesalahan saat menghapus voucher.', 'error');
    }
  }
};

await useAsyncData('voucher-init', async () => {
  selectedIds.value = [];
  
  if (globalStore.activeEventSK) {
    await store.fetchVouchers(); 
  } else {
    store.voucher = [];
  }
  return true;
});

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID').format(val);

const isExpired = (dateStr: string) => {
  if (!dateStr) return false;
  // Ambil tanggal hari ini dengan format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  // Kalau tanggal expired lebih kecil (sebelum) hari ini, berarti true (kadaluarsa)
  return dateStr < today;
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
</style>