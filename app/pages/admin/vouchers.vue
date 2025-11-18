<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Manajemen Voucher</li>
      </ol>
    </nav>

    <div class="card content-card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Daftar Voucher</h5>
        <button class="btn btn-primary btn-sm" @click="showModal = true" :disabled="store.loading">
          <i class="bi bi-plus-lg me-1"></i>
          Generate Voucher
        </button>
      </div>
      <div class="card-body">
        
        <CommonLoadingSpinner v-if="store.loading" class="my-5" />

        <div v-else-if="!store.loading && store.sortedVouchers.length > 0" class="table-responsive">
          <table class="table table-bordered table-hover align-middle fs-sm">
            <thead class="table-light">
              <tr>
                <th>Kode Voucher</th>
                <th>Status</th>
                <th>Diskon</th>
                <th>Tgl Kadaluwarsa</th>
                <th>Dipakai Oleh</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in store.sortedVouchers" :key="v.SK">
                <td class="fw-bold">{{ v.SK }}</td>
                <td>
                  <span :class="['badge', v.Status === 'UNUSED' ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis']">
                    {{ v.Status }}
                  </span>
                </td>
                <td>{{ formatDiscount(v) }}</td>
                <td>{{ v.Expired }}</td>
                <td>{{ v.UsedBy || '-' }}</td>
                <td class="text-center">
                  <button 
                    class="btn btn-danger btn-sm" 
                    title="Hapus"
                    @click="store.deleteVoucher(v.SK)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!store.loading && store.sortedVouchers.length === 0" class="text-center py-5">
          <i class="bi bi-ticket-percent fs-3 text-muted"></i>
          <h6 class="mt-2 mb-1">Belum Ada Voucher</h6>
          <p class="text-muted small">Klik "Generate Voucher" untuk membuat kode voucher baru.</p>
        </div>

      </div>
    </div>
    
    <AdminVoucherFormModal :show="showModal" @close="showModal = false" />

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useVoucherStore } from '~/stores/voucher'; // Import store baru
import type { Voucher } from '~/stores/voucher';

// Setup halaman admin (layout, middleware, judul)
definePageMeta({
  layout: 'admin',
  middleware: () => {
    const { isLoggedIn, isAdmin } = useAuth();
    if (!isLoggedIn.value || !isAdmin.value) {
      return navigateTo('/');
    }
  }
});
useHead({ title: 'Manajemen Voucher' });

// Inisialisasi store
const store = useVoucherStore();
const showModal = ref(false);

// Panggil data saat halaman dimuat
onMounted(() => {
  store.fetchVouchers();
});

// Helper untuk format diskon
const formatDiscount = (v: Voucher) => {
  if (v.DiscountType === 'PERCENT') {
    return `${v.DiscountValue}%`;
  }
  if (v.DiscountType === 'FIXED') {
    return `Rp ${v.DiscountValue.toLocaleString('id-ID')}`;
  }
  return '-';
};
</script>

<style scoped>
/* Style umum, sama seperti halaman admin lainnya */
.fs-sm { font-size: 0.875rem; }
.content-card { border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: none; }
.card-header { background-color: #fff; border-bottom: 1px solid #e2e8f0; padding: 1rem 1.25rem; }
.breadcrumb { background-color: transparent; padding: 0; margin: 0; font-size: 0.9rem; font-weight: 500; }
.breadcrumb a { text-decoration: none; color: var(--bs-secondary-color); }
</style>