<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none txt-caption text-muted">Home</NuxtLink></li>
        <li class="breadcrumb-item txt-caption text-muted">Pengaturan</li>
        <li class="breadcrumb-item active txt-caption text-dark fw-bold" aria-current="page">Control Menu</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 class="mb-0 txt-title fw-bold text-dark">Manajemen Menu</h5>
        
        <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-medium" @click="openModal('add')">
          <i class="bi bi-plus-lg me-1"></i> Tambah Menu
        </button>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0" style="min-width: 800px;">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 txt-label">NAMA MENU & URL</th>
                <th class="txt-label">ICON</th>
                <th class="txt-label">ROLE AKSES</th>
                <th class="txt-label text-center">STATUS</th>
                <th class="text-center pe-4 txt-label" style="width: 120px;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="menu in menusData" :key="menu.id">
                
                <tr>
                  <td class="ps-4">
                    <div class="fw-bold text-dark">{{ menu.title }}</div>
                    <div class="text-muted txt-caption mt-1 font-monospace">{{ menu.url || '-' }}</div>
                  </td>
                  <td>
                    <i :class="`bi ${menu.icon} fs-5 text-secondary`" :title="menu.icon"></i>
                    <span class="txt-caption text-muted ms-2">{{ menu.icon }}</span>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span v-for="role in menu.roles" :key="role" class="badge bg-light text-dark border txt-caption fw-normal">{{ role }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <span v-if="menu.status === 'active'" class="badge bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill border border-success">Active</span>
                    <span v-else class="badge bg-danger bg-opacity-10 text-danger px-3 py-1 rounded-pill border border-danger">Inactive</span>
                  </td>
                  <td class="text-center pe-4">
                    <button class="btn btn-sm text-primary p-0 bg-transparent shadow-none me-2" @click="openModal('edit', menu)" title="Edit">
                      <i class="bi bi-pencil-square fs-5"></i>
                    </button>
                    <button class="btn btn-sm text-danger p-0 bg-transparent shadow-none" @click="deleteMenu(menu)" title="Hapus">
                      <i class="bi bi-trash fs-5"></i>
                    </button>
                  </td>
                </tr>

                <tr v-for="sub in menu.subMenus" :key="sub.id" class="bg-light bg-opacity-50">
                  <td class="ps-4">
                    <div class="d-flex align-items-center ms-4">
                      <i class="bi bi-arrow-return-right text-muted me-2"></i>
                      <div>
                        <div class="text-dark fw-medium">{{ sub.title }}</div>
                        <div class="text-muted txt-caption font-monospace">{{ sub.url }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-muted txt-caption fst-italic">-</td>
                  <td class="text-muted txt-caption fst-italic">Ikut Parent</td>
                  <td class="text-center">
                    <span v-if="sub.status === 'active'" class="badge bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill border border-success">Active</span>
                    <span v-else class="badge bg-danger bg-opacity-10 text-danger px-3 py-1 rounded-pill border border-danger">Inactive</span>
                  </td>
                  <td class="text-center pe-4">
                    <button class="btn btn-sm text-primary p-0 bg-transparent shadow-none me-2" @click="openModal('edit', sub, menu.id)" title="Edit">
                      <i class="bi bi-pencil-square fs-5"></i>
                    </button>
                    <button class="btn btn-sm text-danger p-0 bg-transparent shadow-none" @click="deleteMenu(sub, menu.id)" title="Hapus">
                      <i class="bi bi-trash fs-5"></i>
                    </button>
                  </td>
                </tr>

              </template>

              <tr v-if="menusData.length === 0">
                <td colspan="5" class="text-center py-5 text-muted fst-italic">Belum ada data menu.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="formMenuModal" tabindex="-1" aria-labelledby="formMenuModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div class="modal-header bg-light border-bottom-0 p-3 px-4">
            <h6 class="modal-title txt-subtitle fw-bold text-dark mb-0" id="formMenuModalLabel">
              {{ isEdit ? 'Edit Menu' : 'Tambah Menu Baru' }}
            </h6>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <div class="row g-3">
              
              <div class="col-12" v-if="!isEdit">
                <label class="form-label fw-bold text-muted txt-caption mb-2">Tipe Menu</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="typeMain" value="main" v-model="form.type">
                    <label class="form-check-label" for="typeMain">Menu Utama</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="typeSub" value="sub" v-model="form.type">
                    <label class="form-check-label" for="typeSub">Sub Menu</label>
                  </div>
                </div>
              </div>

              <div class="col-12" v-if="form.type === 'sub'">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Pilih Parent Menu <span class="text-danger">*</span></label>
                <select class="form-select bg-light border-0 shadow-sm" v-model="form.parentId">
                  <option value="" disabled>-- Pilih Menu Parent --</option>
                  <option v-for="m in menusData" :key="m.id" :value="m.id">{{ m.title }}</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Nama Menu <span class="text-danger">*</span></label>
                <input type="text" class="form-control bg-light border-0 shadow-sm" placeholder="Contoh: Keuangan" v-model="form.title">
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Target URL <span class="text-danger">*</span></label>
                <input type="text" class="form-control bg-light border-0 shadow-sm font-monospace text-lowercase" placeholder="/admin/..." v-model="form.url">
              </div>

              <div class="col-md-6" v-if="form.type === 'main'">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Icon (Class Bootstrap) <span class="text-danger">*</span></label>
                <input type="text" class="form-control bg-light border-0 shadow-sm font-monospace text-lowercase" placeholder="bi-house-fill" v-model="form.icon">
                <div class="form-text txt-caption mt-1"><i :class="`bi ${form.icon || 'bi-square-fill'} me-1`"></i> Preview Icon</div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Status Menu</label>
                <select class="form-select bg-light border-0 shadow-sm" v-model="form.status">
                  <option value="active">Active (Ditampilkan)</option>
                  <option value="inactive">Inactive (Disembunyikan)</option>
                </select>
              </div>

              <div class="col-12 mt-4" v-if="form.type === 'main'">
                <label class="form-label fw-bold text-muted txt-caption border-bottom pb-2 w-100 mb-3">Hak Akses Role (Siapa yang boleh lihat?)</label>
                <div class="d-flex flex-wrap gap-3">
                  <div class="form-check" v-for="role in availableRoles" :key="role">
                    <input class="form-check-input" type="checkbox" :id="'role_'+role" :value="role" v-model="form.roles">
                    <label class="form-check-label text-capitalize" :for="'role_'+role">{{ role }}</label>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
            <button type="button" class="btn btn-light border px-4 rounded-pill fw-medium" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary px-4 rounded-pill fw-medium shadow-sm" @click="saveMenu">Simpan Menu</button>
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

// 1. DUMMY DATA ROLE (Didapat dari BE nanti)
const availableRoles = ref(['root', 'admin', 'finance', 'registrasi']);

// 2. DUMMY DATA MENU (Struktur JSON dari BE)
const menusData = ref([
  { 
    id: 1, title: 'Dashboard', url: '/admin', icon: 'bi-speedometer2', status: 'active', 
    roles: ['root', 'admin', 'finance', 'registrasi'], subMenus: [] 
  },
  { 
    id: 2, title: 'Keuangan', url: '#', icon: 'bi-cash-coin', status: 'active', 
    roles: ['root', 'admin', 'finance'], 
    subMenus: [
      { id: 21, title: 'Ringkasan Pendapatan', url: '/admin/finance', status: 'active' },
      { id: 22, title: 'Data Transaksi', url: '/admin/finance/transactions', status: 'active' }
    ]
  }
]);

// 3. STATE MODAL & FORM
const isEdit = ref(false);
const form = ref({
  id: null as any,
  type: 'main', // 'main' atau 'sub'
  parentId: '', // Id parent kalau tipenya 'sub'
  title: '',
  url: '',
  icon: 'bi-circle',
  status: 'active',
  roles: [] as string[]
});

let bootstrapModal: any = null;

onMounted(async () => {
  if (import.meta.client) {
    // ✅ Nuxt 4 pake Dynamic Import dengan await
    const bootstrap = await import('bootstrap'); 
    const modalEl = document.getElementById('formMenuModal');
    if (modalEl) bootstrapModal = new bootstrap.Modal(modalEl);
  }
});

// 4. ACTIONS
const openModal = (mode: 'add' | 'edit', data?: any, parentId?: any) => {
  isEdit.value = mode === 'edit';
  
  if (mode === 'add') {
    form.value = { id: null, type: 'main', parentId: '', title: '', url: '', icon: 'bi-app', status: 'active', roles: ['root'] };
  } else if (data) {
   
    form.value = {
      id: data.id,
      type: parentId ? 'sub' : 'main',
      parentId: parentId || '',
      title: data.title,
      url: data.url,
      icon: data.icon || '',
      status: data.status,
      roles: data.roles ? [...data.roles] : []
    };
  }
  
  bootstrapModal?.show();
};

const saveMenu = () => {
  // Validasi simpel
  if (!form.value.title || !form.value.url) {
    Swal.fire({ icon: 'warning', title: 'Oops', text: 'Nama dan URL Menu wajib diisi!', showConfirmButton: false, timer: 1500 });
    return;
  }

  // NOTE: Di sini nanti lu tembak Axios ke API ($apiBase.post / .put)
  // Ini simulasi nyimpen datanya di Frontend aja buat liat UI
  
  Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Menu telah disimpan.', showConfirmButton: false, timer: 1500 });
  bootstrapModal?.hide();
};

const deleteMenu = (data: any, parentId?: any) => {
  Swal.fire({
    title: `Hapus menu ${data.title}?`,
    text: "Aksi ini tidak dapat dikembalikan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus!'
  }).then((result) => {
    if (result.isConfirmed) {
      // NOTE: Nanti ganti dengan tembak $apiBase.delete
      Swal.fire({ icon: 'success', title: 'Dihapus!', showConfirmButton: false, timer: 1500 });
    }
  });
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");

tr.bg-light.bg-opacity-50:hover {
  background-color: #f1f3f5 !important;
}
</style>