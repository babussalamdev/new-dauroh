<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink to="/admin" class="text-decoration-none txt-caption fw-bold text-primary">
            <i class="bi bi-house-door-fill me-1"></i>Home
          </NuxtLink>
        </li>
        <li class="breadcrumb-item txt-caption text-muted">Pengaturan</li>
        <li class="breadcrumb-item active txt-caption text-dark fw-bold" aria-current="page">Control Role</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 class="mb-0 txt-title fw-bold text-dark">Daftar Role Sistem</h5>
        
        <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-medium" @click="openModal">
          <i class="bi bi-plus-lg me-1"></i> Tambah Role
        </button>
      </div>

      <div class="card-body p-0">
        
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2 txt-caption">Memuat data role...</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 txt-label" style="width: 50px;">NO</th>
                <th class="txt-label">NAMA ROLE</th>
                <th class="txt-label">KODE ROLE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(role, index) in rolesData" :key="role.SK || index">
                <td class="ps-4 text-muted">{{ index + 1 }}</td>
                <td class="fw-bold text-dark text-capitalize">{{ (role.SK || '').replace(/_/g, ' ') }}</td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1">{{ role.SK }}</span></td>
              </tr>
              
              <tr v-if="!loading && rolesData.length === 0">
                <td colspan="3" class="text-center py-5 text-muted fst-italic">Belum ada data role.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="addRoleModal" tabindex="-1" aria-labelledby="addRoleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div class="modal-header bg-light border-bottom-0 p-3 px-4">
            <h6 class="modal-title txt-subtitle fw-bold text-dark mb-0" id="addRoleModalLabel">Tambah Role Baru</h6>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <div class="mb-2">
              <label class="form-label fw-bold text-muted txt-caption mb-1">Kode Role <span class="text-danger">*</span></label>
              <input type="text" class="form-control bg-light border-0 shadow-sm font-monospace text-lowercase" placeholder="contoh: admin_keuangan" v-model="form.sk" @input="formatCode">
              <div class="form-text txt-caption mt-1">Kode digunakan oleh sistem. Gunakan huruf kecil. Spasi akan otomatis diubah menjadi garis bawah ( _ ).</div>
            </div>
          </div>

          <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-light border px-4 rounded-pill fw-medium" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary px-4 rounded-pill fw-medium shadow-sm" @click="saveRole" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ submitting ? 'Menyimpan...' : 'Simpan Role' }}
            </button>
          </div>
          
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAlert } from '~/utils/swal';

useHead({
  title: 'Control Role'
});
definePageMeta({ layout: 'admin' });

const rolesData = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);
const { alert: swalAlert } = useAlert();

const form = ref({
  sk: ''
});

let bootstrapModal: any = null;

onMounted(async () => {
  if (import.meta.client) {
    const bootstrap = await import('bootstrap'); 
    const modalEl = document.getElementById('addRoleModal');
    if (modalEl) bootstrapModal = new bootstrap.Modal(modalEl);
  }
  await fetchRoles();
});

const fetchRoles = async () => {
  loading.value = true;
  try {
    const { $apiBase } = useNuxtApp() as any;
    const res = await $apiBase.get(`/get-default?roles=all&t=${new Date().getTime()}`);
    rolesData.value = res.data || []; 
  } catch (error) {
    console.error("Gagal load roles:", error);
    rolesData.value = []; 
  } finally {
    loading.value = false;
  }
};

const formatCode = () => {
  form.value.sk = form.value.sk.toLowerCase().replace(/\s+/g, '_');
};

const openModal = () => {
  form.value.sk = '';
  bootstrapModal?.show();
};

// --- SIMPAN ROLE BARU ---
const saveRole = async () => {
  if (!form.value.sk) {
    swalAlert('Oops', 'Kode Role wajib diisi!', 'warning');
    return;
  }

  submitting.value = true;
  try {
    const { $apiBase } = useNuxtApp() as any;
    const token = useCookie('AccessToken').value;
    
    const payload = {
      SK: form.value.sk,
      AccessToken: token
    };

    await $apiBase.post('/input-default?roles=create', payload);
    bootstrapModal?.hide();
    swalAlert('Berhasil', 'Role baru berhasil ditambahkan!', 'success');
    
    await fetchRoles();
  } catch (error: any) {
    console.error("Gagal save role:", error);
    // Handling error dengan fallback pesan
    swalAlert('Gagal', error.response?.data?.message ?? 'Terjadi kesalahan saat menyimpan.', 'error');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
</style>