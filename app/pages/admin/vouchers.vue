<template>
  <div>
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin">Home</NuxtLink></li>
        <li class="breadcrumb-item active" aria-current="page">Manajemen Voucher</li>
      </ol>
    </nav>

    <div class="card content-card">
      
      <div class="card-header d-flex justify-content-between align-items-center bg-white py-3">
        <div class="d-flex align-items-center gap-3">
            <h5 class="mb-0 text-nowrap">Manajemen Vouchers</h5>
            
            <select 
                class="form-select form-select-sm" 
                style="width: 250px; border-color: #009B4D;" 
                v-model="store.selectedEventSK"
                @change="store.fetchVouchers()"
            >
                <option value="" disabled>-- Pilih Event Dahulu --</option>
                <option v-for="event in store.events" :key="event.SK" :value="event.SK">
                    {{ event.Title }}
                </option>
            </select>
        </div>

        <div class="d-flex gap-2" v-if="store.selectedEventSK">
            <button class="btn btn-danger btn-sm" disabled>Reset</button>
            <button class="btn btn-primary btn-sm" @click="showModal = true" :disabled="store.loading">
              Tambah
            </button>
        </div>
      </div>

      <div class="card-body p-0">
        
        <div v-if="!store.selectedEventSK" class="text-center py-5 text-muted bg-light">
            <i class="bi bi-arrow-up-circle fs-1 mb-2 d-block text-secondary" style="opacity: 0.5;"></i>
            <p class="mb-0 fw-medium">Silakan pilih <strong>Event</strong> di pojok kiri atas terlebih dahulu.</p>
            <small>Data voucher akan muncul setelah event dipilih.</small>
        </div>

        <div v-else>
            <CommonLoadingSpinner v-if="store.loading" class="my-5" />

            <div v-else-if="store.vouchers.length > 0" class="table-responsive">
              <table class="table table-striped table-hover align-middle mb-0" style="font-size: 0.9rem;">
                <thead class="table-primary text-white">
                  <tr>
                    <th class="py-3 ps-4">Code</th>
                    <th class="py-3">Status</th>
                    <th class="py-3">Expired</th>
                    <th class="py-3">Diskon</th>
                    <th class="py-3">User</th>
                    <th class="py-3 text-center pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in store.vouchers" :key="v.SK">
                    <td class="ps-4 fw-medium">{{ v.SK }}</td>
                    <td>{{ v.Status }}</td>
                    <td>{{ v.Expired }}</td>
                    <td>{{ formatCurrency(v.Nominal) }}</td>
                    <td>{{ v.User }}</td>
                    <td class="text-center pe-4">
                      <button 
                        class="btn btn-danger btn-sm rounded" 
                        style="width: 32px; height: 32px; padding: 0;"
                        title="Hapus"
                        @click="store.deleteVoucher(v.SK)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="text-center py-5">
              <i class="bi bi-ticket-perforated fs-3 text-muted"></i>
              <h6 class="mt-2 mb-1">Belum Ada Voucher</h6>
              <p class="text-muted small">Event ini belum memiliki voucher. Klik "Tambah Kupon" untuk membuat.</p>
            </div>
        </div>

      </div>
    </div>
    
    <AdminVoucherFormModal :show="showModal" @close="showModal = false" />

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useVoucherStore } from '~/stores/voucher'; 

// Metadata & Middleware
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

// Init Store
const store = useVoucherStore();
const showModal = ref(false);

await useAsyncData('voucher-events-init', async () => {
  await store.fetchEvents();
  // Reset selection saat inisialisasi halaman
  store.selectedEventSK = '';
  store.vouchers = [];
  return true;
});

// Helper Function (UI Only)
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

.table-primary {
    --bs-table-bg: #009B4D;
    --bs-table-color: #fff;
    border-color: transparent;
}

.table > :not(caption) > * > * {
    border-bottom-width: 1px; 
}
</style>