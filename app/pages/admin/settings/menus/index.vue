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
        <li class="breadcrumb-item active txt-caption text-dark fw-bold" aria-current="page">Control Menu</li>
      </ol>
    </nav>

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 class="mb-0 txt-title fw-bold text-dark">Manajemen Menu Utama</h5>
        
        <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-medium" @click="openModal('add')">
          <i class="bi bi-plus-lg me-1"></i> Tambah Menu
        </button>
      </div>

      <div class="card-body p-0">
        
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2 txt-caption">Memuat data menu...</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0" style="min-width: 800px;">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 txt-label">NAMA MENU & URL</th>
                <th class="txt-label">ICON</th>
                <th class="txt-label">ROLE AKSES</th>
                <th class="text-center pe-4 txt-label" style="width: 150px;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="menu in menusData" :key="menu.SK">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ menu.Title || menu.title }}</div>
                  <div class="text-muted txt-caption mt-1 font-monospace">{{ menu.URL || menu.url || '-' }}</div>
                </td>
                <td>
                  <i :class="`bi ${menu.Icon || menu.icon} fs-5 text-secondary`"></i>
                  <span class="txt-caption text-muted ms-2">{{ menu.Icon || menu.icon }}</span>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-for="role in (menu.Roles || menu.roles || '').split(',')" :key="role" class="badge bg-light text-dark border txt-caption fw-normal text-capitalize">
                      {{ role.trim() }}
                    </span>
                  </div>
                </td>
                <td class="text-center pe-4">
                  <NuxtLink :to="`/admin/settings/menus/${encodeURIComponent(menu.SK)}`" class="btn btn-sm text-info p-0 bg-transparent shadow-none me-3" title="Lihat Sub Menu">
                    <i class="bi bi-info-circle-fill fs-5"></i>
                  </NuxtLink>
                  <button class="btn btn-sm text-primary p-0 bg-transparent shadow-none" @click="openModal('edit', menu)" title="Edit">
                    <i class="bi bi-pencil-square fs-5"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="!loading && menusData.length === 0">
                <td colspan="4" class="text-center py-5 text-muted fst-italic">Belum ada data menu utama.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="formMenuModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div class="modal-header bg-light border-bottom-0 p-3 px-4">
            <h6 class="modal-title txt-subtitle fw-bold text-dark mb-0">
              {{ isEdit ? 'Edit Menu Utama' : 'Tambah Menu Utama' }}
            </h6>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Nama Menu <span class="text-danger">*</span></label>
                <input type="text" class="form-control bg-light border-0 shadow-sm" placeholder="Contoh: Keuangan" v-model="form.title">
              </div>

              <div class="col-12">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Target URL</label>
                <input type="text" class="form-control bg-light border-0 shadow-sm font-monospace text-lowercase" placeholder="/admin/..." v-model="form.url">
                <small class="text-muted txt-caption">Kosongkan jika menu ini hanya sebagai dropdown parent.</small>
              </div>

              <div class="col-12">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Icon (Class Bootstrap) <span class="text-danger">*</span></label>
                <input type="text" class="form-control bg-light border-0 shadow-sm font-monospace text-lowercase" placeholder="bi-house-fill" v-model="form.icon">
                <div class="form-text txt-caption mt-1"><i :class="`bi ${form.icon || 'bi-square-fill'} me-1`"></i> Preview Icon</div>
              </div>

              <div class="col-12 mt-4">
                <label class="form-label fw-bold text-muted txt-caption border-bottom pb-2 w-100 mb-3">Hak Akses Role</label>
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
            <button type="button" class="btn btn-primary px-4 rounded-pill fw-medium shadow-sm" @click="saveMenu" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ submitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
          
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

useHead({
  title: 'Control Menu'
});

definePageMeta({ layout: 'admin' });

const availableRoles = ref<string[]>([]);
const menusData = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);

const isEdit = ref(false);
const form = ref({
  sk: '', 
  title: '',
  url: '',
  icon: 'bi-circle',
  roles: [] as string[]
});

let bootstrapModal: any = null;

onMounted(async () => {
  if (import.meta.client) {
    const bootstrap = await import('bootstrap'); 
    const modalEl = document.getElementById('formMenuModal');
    if (modalEl) bootstrapModal = new bootstrap.Modal(modalEl);
  }
  await fetchAvailableRoles();
  await fetchMenus();
});

const fetchAvailableRoles = async () => {
  try {
    const { $apiBase } = useNuxtApp() as any;
    const res = await $apiBase.get(`/get-default?roles=all&t=${new Date().getTime()}`);
    const rolesData = res.data || [];
    availableRoles.value = rolesData.map((role: any) => role.SK || role.sk);
  } catch (error) {
    console.error("Gagal narik data role:", error);
  }
};

const fetchMenus = async () => {
  loading.value = true;
  try {
    const { $apiBase } = useNuxtApp() as any;
    //  HANYA GET PARENT
    const res = await $apiBase.get(`/get-default?menus=parent&t=${new Date().getTime()}`);
    menusData.value = res.data || []; 
  } catch (error) {
    console.error("Gagal load menu:", error);
    menusData.value = []; 
  } finally {
    loading.value = false;
  }
};

const openModal = (mode: 'add' | 'edit', data?: any) => {
  isEdit.value = mode === 'edit';
  
  if (mode === 'add') {
    form.value = { sk: '', title: '', url: '', icon: 'bi-app', roles: [] }; 
  } else if (data) {
    let roleArray: string[] = [];
    const rolesString = data.Roles || data.roles || "";
    
    if (rolesString) {
      // 1. Pecah dulu data dari BE
      const rawRoles = rolesString.split(',').map((r: string) => r.trim());
      
      // 2. 🟢 INI KUNCI PENYARINGANNYA: 
      // Cuma ambil role yang ada di master data (availableRoles)
      roleArray = rawRoles.filter((r: string) => availableRoles.value.includes(r));
    }

    form.value = {
      sk: data.SK, 
      title: data.Title || data.title || '', 
      url: data.URL || data.url || '',
      icon: data.Icon || data.icon || '',
      roles: roleArray
    };
  }
  bootstrapModal?.show();
};

const saveMenu = async () => {
  if (!form.value.title) {
    Swal.fire({ icon: 'warning', title: 'Oops', text: 'Nama Menu wajib diisi!', showConfirmButton: false, timer: 1500 });
    return;
  }

  submitting.value = true;
  try {
    const { $apiBase } = useNuxtApp() as any;
    const token = useCookie('AccessToken').value;
    
    const payload = {
      Title: form.value.title,
      Icon: form.value.icon, 
      URL: form.value.url,
      Roles: form.value.roles.join(', '), 
      AccessToken: token
    };

    if (isEdit.value) {
      const encodedSk = encodeURIComponent(form.value.sk); 
      await $apiBase.put(`/update-default?menus=${encodedSk}`, payload);
    } else {
      await $apiBase.post('/input-default?menus=create-parent', payload);
    }

    bootstrapModal?.hide();
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Menu telah disimpan.', showConfirmButton: false, timer: 1500 });
    await fetchMenus();
  } catch (error: any) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Terjadi kesalahan' });
  } finally {
    submitting.value = false;
  }
};
</script>