<template>
  <div>
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Pengaturan'}, {text: 'Control Menu'}]" />

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex justify-content-between align-items-center">
        <h6 class="mb-0 fw-bold txt-subtitle text-dark">Manajemen Menu Utama</h6>
        
        <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-medium" @click="openModal('add')">
          Tambah Menu
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

    <div class="modal fade" id="formMenuModal" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
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
                <label class="form-label fw-bold text-muted txt-caption mb-1">Urutan Menu (Sorting) <span class="text-danger">*</span></label>
                <input type="number" class="form-control bg-light border-0 shadow-sm" placeholder="Contoh: 1" v-model.number="form.orders">
                <small class="text-muted txt-caption">Angka lebih kecil akan muncul lebih awal.</small>
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
import { ref, onMounted, computed } from 'vue';
import { useAlert } from '~/utils/swal';

useHead({
  title: 'Control Menu'
});

definePageMeta({ layout: 'admin' });

const availableRoles = ref<string[]>([]);
const menusData = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);
const { alert: swalAlert } = useAlert();

const isEdit = ref(false);
const form = ref({
  sk: '', 
  title: '',
  url: '',
  icon: 'bi-circle',
  roles: [] as string[],
  orders: 1
});

const sortedMenus = computed(() => {
  return [...menusData.value].sort((a, b) => {
    const orderA = parseInt(a.Orders || a.orders || 99);
    const orderB = parseInt(b.Orders || b.orders || 99);
    return orderA - orderB;
  });
});

let bootstrapModal: any = null;

onMounted(async () => {
  if (import.meta.client) {
    const bootstrap = await import('bootstrap'); 
    const modalEl = document.getElementById('formMenuModal');
    if (modalEl) bootstrapModal = new bootstrap.Modal(modalEl);
  }
  await fetchMenus();
});

const fetchMenus = async () => {
  loading.value = true;
  try {
    const { $apiBase } = useNuxtApp() as any;
    const res = await $apiBase.get(`/get-default?menus=parent&t=${new Date().getTime()}`);
    menusData.value = res.data?.menu || []; 
    availableRoles.value = res.data?.roles || [];
    
  } catch (error) {
    console.error("Gagal load menu:", error);
    menusData.value = []; 
    availableRoles.value = [];
  } finally {
    loading.value = false;
  }
};

const openModal = (mode: 'add' | 'edit', data?: any) => {
  isEdit.value = mode === 'edit';
  
  if (mode === 'add') {
    form.value = { sk: '', title: '', url: '', icon: 'bi-app', roles: [], orders: 1 }; 
  } else if (data) {
    let roleArray: string[] = [];
    const rolesString = data.Roles || data.roles || "";
    
    if (rolesString) {
      // 1. Pecah dulu data dari BE
      const rawRoles = rolesString.split(',').map((r: string) => r.trim());
      // Cuma ambil role yang ada di master data (availableRoles)
      roleArray = rawRoles.filter((r: string) => availableRoles.value.includes(r));
    }

    form.value = {
      sk: data.SK, 
      title: data.Title || data.title || '', 
      url: data.URL || data.url || '',
      icon: data.Icon || data.icon || '',
      roles: roleArray,
      orders: data.Orders || data.orders || 1
    };
  }
  bootstrapModal?.show();
};

const saveMenu = async () => {
  if (!form.value.title) {
    swalAlert('Oops', 'Nama Menu wajib diisi!', 'warning');
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
      Orders: String(form.value.orders),
      AccessToken: token
    };

    if (isEdit.value) {
      const encodedSk = encodeURIComponent(form.value.sk); 
      await $apiBase.put(`/update-default?menus=${encodedSk}`, payload);
    } else {
      await $apiBase.post('/input-default?menus=create-parent', payload);
    }

    bootstrapModal?.hide();
    swalAlert('Berhasil', 'Konfigurasi menu utama telah disimpan.', 'success');
    
    await fetchMenus();
  } catch (error: any) {
    swalAlert('Gagal', error.response?.data?.message ?? 'Terjadi kesalahan sistem saat menyimpan menu.', 'error');
  } finally {
    submitting.value = false;
  }
};
</script>