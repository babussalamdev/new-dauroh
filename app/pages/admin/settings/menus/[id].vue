<template>
  <div class="container-fluid px-2 px-md-4 py-4">
    
    <CommonBreadcrumb :items="[{text: 'Dashboard', to: '/admin', icon: 'bi bi-house'}, {text: 'Pengaturan'}, {text: 'Control Menu', to: '/admin/settings/menus'}, {text: 'Sub Menu'}]" />

    <div class="card content-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-header bg-white p-3 px-md-4 py-md-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-0 txt-title fw-bold text-dark">Manajemen Sub Menu</h5>
          <p class="txt-caption text-muted mb-0 mt-1">ID Parent: <span class="font-monospace fw-bold">{{ parentSK }}</span></p>
        </div>
        
        <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fw-medium" @click="openModal('add')">
          <i class="bi bi-plus-lg me-1"></i> Tambah Sub Menu
        </button>
      </div>

      <div class="card-body p-0">
        
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0" style="min-width: 600px;">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 txt-label">NAMA SUB MENU & URL</th>
                <th class="txt-label">ROLE AKSES</th>
                <th class="text-center pe-4 txt-label" style="width: 100px;">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in sortedMenus" :key="sub.SK">
                <td class="ps-4">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-arrow-return-right text-muted me-3"></i>
                    <div>
                      <div class="fw-bold text-dark">{{ sub.Title || sub.title }}</div>
                      <div class="text-muted txt-caption mt-1 font-monospace">{{ sub.URL || sub.url }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-for="role in (sub.Roles || sub.roles || '').split(',')" :key="role" class="badge bg-light text-dark border txt-caption fw-normal text-capitalize">
                      {{ role.trim() }}
                    </span>
                  </div>
                </td>
                <td class="text-center pe-4">
                  <button class="btn btn-sm text-primary p-0 bg-transparent shadow-none" @click="openModal('edit', sub)" title="Edit">
                    <i class="bi bi-pencil-square fs-5"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="!loading && childMenus.length === 0">
                <td colspan="3" class="text-center py-5 text-muted fst-italic">Belum ada sub menu.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="formChildModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div class="modal-header bg-light border-bottom-0 p-3 px-4">
            <h6 class="modal-title txt-subtitle fw-bold text-dark mb-0">
              {{ isEdit ? 'Edit Sub Menu' : 'Tambah Sub Menu' }}
            </h6>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body p-4">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Nama Sub Menu <span class="text-danger">*</span></label>
                <input type="text" class="form-control bg-light border-0 shadow-sm" placeholder="Contoh: Laporan Export" v-model="form.title">
              </div>

              <div class="col-12">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Target URL <span class="text-danger">*</span></label>
                <input type="text" class="form-control bg-light border-0 shadow-sm font-monospace text-lowercase" placeholder="/admin/..." v-model="form.url">
              </div>

              <div class="col-12">
                <label class="form-label fw-bold text-muted txt-caption mb-1">Urutan Sub Menu <span class="text-danger">*</span></label>
                <input type="number" class="form-control bg-light border-0 shadow-sm" placeholder="Contoh: 1" v-model.number="form.orders">
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
            <button type="button" class="btn btn-primary px-4 rounded-pill fw-medium shadow-sm" @click="saveSubMenu" :disabled="submitting">
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
import { useRoute } from 'vue-router';
import { useAlert } from '~/utils/swal';

useHead({
  title: 'Control Sub Menu'
});
definePageMeta({ layout: 'admin' });

const route = useRoute();
const { alert: swalAlert } = useAlert();


const rawParentSK = route.params.id as string; 
const parentSK = rawParentSK.replace('parent#', '');
const availableRoles = ref<string[]>([]);
const childMenus = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);

const isEdit = ref(false);
const form = ref({
  sk: '', 
  title: '',
  url: '',
  roles: [] as string[],
  orders: 1
});

const sortedMenus = computed(() => {
  return [...childMenus.value].sort((a, b) => {
    const orderA = parseInt(a.Orders || a.orders || 99);
    const orderB = parseInt(b.Orders || b.orders || 99);
    return orderA - orderB;
  });
});

let bootstrapModal: any = null;

onMounted(async () => {
  if (import.meta.client) {
    const bootstrap = await import('bootstrap'); 
    const modalEl = document.getElementById('formChildModal');
    if (modalEl) bootstrapModal = new bootstrap.Modal(modalEl);
  }
  await fetchChildMenus();
});

const fetchChildMenus = async () => {
  loading.value = true;
  try {
    const { $apiBase } = useNuxtApp() as any;
    const res = await $apiBase.get(`/get-default?menus=child&skparent=${parentSK}&t=${new Date().getTime()}`);
    childMenus.value = res.data?.menu || [];
    availableRoles.value = res.data?.roles || [];
    
  } catch (error) {
    console.error("Gagal load sub menu:", error);
    childMenus.value = []; 
    availableRoles.value = [];
  } finally {
    loading.value = false;
  }
};


const openModal = (mode: 'add' | 'edit', data?: any) => {
  isEdit.value = mode === 'edit';
  
  if (mode === 'add') {
    form.value = { sk: '', title: '', url: '', roles: [], orders: 1 };
  } else if (data) {
    let roleArray: string[] = [];
    const rolesString = data.Roles || data.roles || "";
    if (rolesString) roleArray = rolesString.split(',').map((r: string) => r.trim());

    form.value = {
      sk: data.SK, 
      title: data.Title || data.title || '', 
      url: data.URL || data.url || '',
      roles: roleArray,
      orders: data.Orders || data.orders || 1
    };
  }
  bootstrapModal?.show();
};

const saveSubMenu = async () => {
  if (!form.value.title || !form.value.url) {
    swalAlert('Oops', 'Nama dan URL wajib diisi!', 'warning');
    return;
  }

  submitting.value = true;
  try {
    const { $apiBase } = useNuxtApp() as any;
    const token = useCookie('AccessToken').value;
    const payload = {
      Title: form.value.title,
      URL: form.value.url,
      Roles: form.value.roles.join(', '), 
      Orders: String(form.value.orders),
      AccessToken: token
    };

    if (isEdit.value) {
      const encodedSk = encodeURIComponent(form.value.sk);
      await $apiBase.put(`/update-default?menus=${encodedSk}`, payload);
    } else {
      await $apiBase.post(`/input-default?menus=create-child&skparent=${parentSK}`, payload);
    }

    bootstrapModal?.hide();
  
    swalAlert('Berhasil', 'Sub Menu telah berhasil disimpan.', 'success');
    
    await fetchChildMenus();
  } catch (error: any) {
    swalAlert('Gagal', error.response?.data?.message ?? 'Terjadi kesalahan sistem', 'error');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/admin/cards.css");
@import url("~/assets/css/admin/tables.css");
</style>