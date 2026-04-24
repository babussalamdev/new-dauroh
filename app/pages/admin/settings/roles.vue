<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none txt-caption text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item txt-caption text-muted">Pengaturan</li>
        <li class="breadcrumb-item active txt-caption text-dark fw-bold" aria-current="page">Control Role</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 class="mb-0 txt-title fw-bold text-dark">Daftar Role Sistem</h5>
        
        <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-medium" data-bs-toggle="modal" data-bs-target="#addRoleModal">
          <i class="bi bi-plus-lg me-1"></i> Tambah Role
        </button>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 txt-label" style="width: 50px;">NO</th>
                <th class="txt-label">NAMA ROLE</th>
                <th class="txt-label">KODE ROLE (SISTEM)</th>
                <th class="text-center pe-4 txt-label" style="width: 100px;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(role, index) in rolesData" :key="role.code">
                <td class="ps-4 text-muted">{{ index + 1 }}</td>
                <td class="fw-bold text-dark">{{ role.name }}</td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1">{{ role.code }}</span></td>
                <td class="text-center pe-4">
                  <button v-if="role.code !== 'root'" class="btn btn-sm text-danger p-0 border-0 bg-transparent shadow-none" @click="deleteRole(role)" title="Hapus Role">
                    <i class="bi bi-trash fs-5"></i>
                  </button>
                  <span v-else class="text-muted txt-caption fst-italic">Default</span>
                </td>
              </tr>
              
              <tr v-if="rolesData.length === 0">
                <td colspan="4" class="text-center py-5 text-muted fst-italic">Belum ada data role.</td>
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
            <div class="mb-3">
              <label class="form-label fw-bold text-muted txt-caption mb-1">Nama Role <span class="text-danger">*</span></label>
              <input type="text" class="form-control bg-light border-0 shadow-sm" placeholder="Contoh: Admin Keuangan" v-model="form.name">
            </div>
            
            <div class="mb-2">
              <label class="form-label fw-bold text-muted txt-caption mb-1">Kode Role <span class="text-danger">*</span></label>
              <input type="text" class="form-control bg-light border-0 shadow-sm font-monospace text-lowercase" placeholder="contoh: admin_keuangan" v-model="form.code" @input="formatCode">
              <div class="form-text txt-caption mt-1">Kode digunakan oleh sistem. Gunakan huruf kecil tanpa spasi.</div>
            </div>
          </div>

          <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-light border px-4 rounded-pill fw-medium" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary px-4 rounded-pill fw-medium shadow-sm" @click="saveRole">Simpan Role</button>
          </div>
          
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Swal from 'sweetalert2';

definePageMeta({ layout: 'admin' });

// DUMMY DATA Sesuai permintaan BE lu
const rolesData = ref([
  { name: 'Super Admin', code: 'root' },
  { name: 'Administrator', code: 'admin' },
  { name: 'Finance / Keuangan', code: 'finance' },
  { name: 'Staff Registrasi', code: 'registrasi' }
]);

const form = ref({
  name: '',
  code: ''
});

// Bikin otomatis format code: huruf kecil & spasi jadi underscore
const formatCode = () => {
  form.value.code = form.value.code.toLowerCase().replace(/\s+/g, '_');
};

const saveRole = () => {
  if (!form.value.name || !form.value.code) {
    Swal.fire({ icon: 'warning', title: 'Oops', text: 'Nama dan Kode Role wajib diisi!', showConfirmButton: false, timer: 1500 });
    return;
  }

  // Simulasi nyimpen data
  rolesData.value.push({ name: form.value.name, code: form.value.code });
  
  // Bersihin form & tutup modal
  form.value = { name: '', code: '' };
  
  // Tutup modal pakai Vanilla JS Bootstrap (karena kita ga panggil class Modal)
  document.getElementById('addRoleModal')?.click(); 
  
  Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Role baru ditambahkan!', showConfirmButton: false, timer: 1500 });
};

const deleteRole = (role: any) => {
  Swal.fire({
    title: `Hapus Role ${role.name}?`,
    text: "Role yang dihapus tidak dapat dikembalikan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      // Simulasi hapus data
      rolesData.value = rolesData.value.filter(r => r.code !== role.code);
      Swal.fire({ icon: 'success', title: 'Dihapus!', showConfirmButton: false, timer: 1500 });
    }
  });
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
</style>