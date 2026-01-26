<template>
  <div class="bg-white min-vh-100 pb-5 font-blog d-flex flex-column">
    
    <div v-if="daurohStore.loading.detailPublic" class="container py-5 text-center d-flex align-items-center justify-content-center flex-grow-1">
      <div>
         <div class="spinner-border text-dark mb-3" role="status" style="width: 3rem; height: 3rem;"></div>
      </div>
    </div>

    <div v-else-if="!dauroh" class="container py-5 text-center d-flex align-items-center justify-content-center flex-grow-1">
      <div>
        <h3 class="fw-bold text-dark mb-3">Konten Tidak Ditemukan</h3>
        <NuxtLink to="/" class="btn btn-dark rounded-pill px-5 fw-bold">Kembali ke Home</NuxtLink>
      </div>
    </div>

    <div v-else>
      
      <div class="container pt-5 pb-4 text-center" style="max-width: 900px;">
         <h1 class="display-5 fw-bold text-dark mb-3 lh-sm">{{ dauroh.Title }}</h1>
         
         <div class="d-flex justify-content-center align-items-center gap-3 text-secondary small text-uppercase ls-1 flex-wrap">
           <span><i class="bi bi-calendar3 me-1"></i> {{ formatDate(dauroh.Date) }}</span>
           <span class="text-light-gray d-none d-sm-inline">|</span>
           <span><i class="bi bi-geo-alt me-1"></i> {{ dauroh.Place }}</span>
         </div>
      </div>

      <div class="container pb-5 flex-grow-1">
        <div class="row justify-content-center g-5">
          
          <div class="col-lg-8">
            <div class="mb-5 rounded-4 overflow-hidden shadow-sm position-relative bg-light mx-auto border" style="max-width: 100%;">
               <div class="aspect-ratio-box">
                   <img 
                      v-if="dauroh.Picture"
                      :src="`${imgUrl}/${dauroh.SK}/${dauroh.Picture}.webp`" 
                      class="img-poster" 
                      :alt="dauroh.Title"
                      @error="onImageError"
                   >
                   <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted py-5">
                      <div class="text-center">
                         <i class="bi bi-image fs-1 opacity-25"></i>
                         <p class="small m-0 mt-2">Tidak ada gambar</p>
                      </div>
                   </div>
               </div>
            </div>

            <article class="blog-body ql-editor px-md-2">
               <div v-if="dauroh.Description" v-html="dauroh.Description"></div>
               <p v-else class="text-muted fst-italic text-center py-5 bg-light rounded-3">
                 Belum ada deskripsi lengkap untuk event ini.
               </p>
            </article>
          </div>
          
          <div class="col-lg-4 ps-lg-4">
             <div class="sticky-top" style="top: 100px; z-index: 10;">
                
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                   <div class="card-body p-4 pt-5 text-center">
                      <p class="text-muted x-small text-uppercase fw-bold mb-1 ls-1">Harga Tiket</p>
                      <h3 class="fw-bold text-primary mb-4">{{ formatCurrency(dauroh.Price) }}</h3>
                      
                      <button 
                        class="btn btn-dark w-100 rounded-pill py-3 fw-bold shadow-sm mb-3 transition-transform"
                        :disabled="!registrationStatus.canRegister"
                        @click="handleRegisterClick"
                      >
                        {{ registrationStatus.message }}
                      </button>

                      <div v-if="!registrationStatus.canRegister" class="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis x-small py-2 mb-0 rounded-3">
                         <i class="bi bi-info-circle me-1"></i> {{ registrationStatus.message }}
                      </div>
                      
                      <span class="badge bg-light text-dark border px-3 py-2 rounded-pill text-uppercase x-small fw-bold shadow-sm mt-3">
                           {{ getGenderLabel(dauroh.Gender) }}
                       </span>
                   </div>
                   
                   <div class="card-footer bg-light p-3 text-center border-0 x-small text-muted">
                      Ada kendala? <a href="#" class="text-dark fw-bold text-decoration-none">Hubungi Admin</a>
                   </div>
                </div>

                <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                   <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                      <h6 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                         <i class="bi bi-pie-chart-fill text-primary"></i> Sisa Kuota
                      </h6>
                   </div>
                   <div class="card-body p-4">
                      
                      <div v-if="dauroh.Quota_Total === 'non-quota'" class="text-center py-2">
                         <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                            <i class="bi bi-infinity me-1"></i> Tanpa Batas
                         </span>
                      </div>

                      <div v-else class="d-flex flex-column gap-3">
                         <div v-if="showIkhwan" class="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 border-start border-4 border-primary">
                            <span class="small fw-bold text-secondary ps-1">Ikhwan</span>
                            <span class="fw-bold text-dark">
                               {{ formatQuota(getRemaining(dauroh.Quota_Ikhwan, dauroh.Sold_Ikhwan)) }}
                            </span>
                         </div>

                         <div v-if="showAkhwat" class="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 border-start border-4 border-danger">
                            <span class="small fw-bold text-secondary ps-1">Akhwat</span>
                            <span class="fw-bold text-dark">
                               {{ formatQuota(getRemaining(dauroh.Quota_Akhwat, dauroh.Sold_Akhwat)) }}
                            </span>
                         </div>

                         <div v-if="showTotal && !showIkhwan && !showAkhwat" class="d-flex justify-content-between align-items-center p-2 bg-light rounded-3">
                            <span class="small fw-bold text-secondary">Tiket Tersedia</span>
                            <span class="fw-bold text-dark">
                               {{ formatQuota(getRemaining(dauroh.Quota_Total, dauroh.Sold_Total)) }}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>

                <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white border">
                   <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0">
                      <h6 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                         <i class="bi bi-info-circle-fill text-primary"></i> Detail Event
                      </h6>
                   </div>
                   <div class="card-body p-4">
                      <ul class="list-unstyled mb-0 d-flex flex-column gap-3 small text-secondary">
                         <li class="d-flex justify-content-between border-bottom pb-2">
                            <span>Hari</span>
                            <span class="fw-bold text-dark">{{ getDayName(dauroh.Date) }}</span>
                         </li>
                         <li class="d-flex justify-content-between border-bottom pb-2">
                            <span>Jam</span>
                            <span class="fw-bold text-dark">{{ getTimeRange(dauroh.Date) }}</span>
                         </li>
                         
                         <li class="d-flex justify-content-between">
                            <span>Total Kuota</span>
                            <span class="fw-bold text-dark text-end" style="max-width: 60%;">
                               {{ totalQuotaDisplay }}
                            </span>
                         </li>
                      </ul>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDaurohStore } from '~/stores/dauroh';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import Swal from 'sweetalert2'; 
import 'quill/dist/quill.snow.css'; 

const route = useRoute();
const router = useRouter();
const daurohStore = useDaurohStore();
const { isLoggedIn } = useAuth();
const config = useRuntimeConfig();

const daurohSK = String(route.params.id);
const imgUrl = ref(config.public.img || '');
const currentUrl = ref('');

const dauroh = computed(() => daurohStore.currentPublicDaurohDetail);

// --- HELPER LOGIC ---

// 1. Gender Label
const getGenderLabel = (g: string) => {
    if (!g) return 'Umum';
    const lower = g.toLowerCase();
    
    if (lower.includes('ikhwan') && lower.includes('akhwat')) return 'Umum'; 
    if (lower.includes('ikhwan') || lower.includes('laki') || lower.includes('pria')) return 'Khusus Ikhwan';
    if (lower.includes('akhwat') || lower.includes('perempuan') || lower.includes('wanita')) return 'Khusus Akhwat';
    
    return 'Umum';
};

// 2. Toggles untuk baris kuota
const showTotal = computed(() => {
    if (!dauroh.value) return false;
    if (dauroh.value.Quota_Total === 'non-quota') return true;
    const g = dauroh.value.Gender?.toLowerCase() || '';
    return g === 'umum' || (!g.includes('ikhwan') && !g.includes('akhwat'));
});

const showIkhwan = computed(() => {
    const g = dauroh.value?.Gender?.toLowerCase() || '';
    return g.includes('ikhwan') || g.includes('laki') || g.includes('pria') || g.includes('ikhwan, akhwat'); 
});

const showAkhwat = computed(() => {
    const g = dauroh.value?.Gender?.toLowerCase() || '';
    return g.includes('akhwat') || g.includes('perempuan') || g.includes('wanita') || g.includes('ikhwan, akhwat');
});

// 3. Hitung Sisa Kuota (Quota - Sold)
const getRemaining = (quota: number | string, sold: number | string) => {
    if (quota === 'non-quota') return 'Tanpa Batas';
    const q = Number(quota) || 0;
    const s = Number(sold) || 0;
    const remain = q - s;
    return remain < 0 ? 0 : remain; // Safety check
};

// 4. Format Angka Kuota
const formatQuota = (val: string | number) => {
    if (val === 'non-quota' || val === 'Tanpa Batas') return 'Tanpa Batas';
    if (val === 0 || val === '0') return '0 (Penuh)';
    return `${val}`;
};

// 5. Total Kapasitas Display (Ambil Murni Quota Awal)
const totalQuotaDisplay = computed(() => {
    if (!dauroh.value) return '-';
    const d = dauroh.value;

    if (d.Quota_Total === 'non-quota') return 'Tanpa Batas';

    // Karena API 'Quota' = Kapasitas Awal, kita langsung tampilkan saja.
    // Tidak perlu ditambah Sold lagi.
    
    let text = [];
    if (showIkhwan.value) text.push(`Ikhwan: ${d.Quota_Ikhwan}`);
    if (showAkhwat.value) text.push(`Akhwat: ${d.Quota_Akhwat}`);
    
    if (text.length > 0) return text.join(', ');
    
    return `${d.Quota_Total} Kursi`;
});

// 6. Cek Status Registrasi
const registrationStatus = computed(() => {
  const d = dauroh.value;
  if (!d) return { canRegister: false, message: 'Loading...' };
  
  if (d.Status !== 'active') return { canRegister: false, message: 'Event Selesai / Tutup' };
  
  if (d.Quota_Total === 'non-quota') {
     return { canRegister: true, message: 'Daftar Sekarang' };
  }

  // Cek apakah masih ada sisa (Quota - Sold > 0)
  const remTotal = getRemaining(d.Quota_Total, d.Sold_Total);
  const remIkhwan = getRemaining(d.Quota_Ikhwan, d.Sold_Ikhwan);
  const remAkhwat = getRemaining(d.Quota_Akhwat, d.Sold_Akhwat);

  // Jika salah satu slot masih ada sisa, tombol aktif
  if (
    (typeof remTotal === 'number' && remTotal > 0) || 
    (typeof remIkhwan === 'number' && remIkhwan > 0) || 
    (typeof remAkhwat === 'number' && remAkhwat > 0)
  ) {
     return { canRegister: true, message: 'Daftar Sekarang' };
  }
  
  return { canRegister: false, message: 'Kuota Penuh' };
});

onMounted(() => {
  currentUrl.value = window.location.href;
  if (daurohSK) {
    daurohStore.fetchPublicDaurohDetail(daurohSK);
  }
});

watch(dauroh, (newVal) => {
  if (newVal) {
    useHead({
      title: `${newVal.Title} - Babussalam Event`,
    });
  }
});

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).style.display = 'none';
};

const formatCurrency = (val: number | string) => {
  if (!val || Number(val) === 0) return 'GRATIS';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val));
};

const formatDate = (dateObj: any) => {
  if (!dateObj || typeof dateObj !== 'object') return 'Akan Datang';
  const rawDates = Object.values(dateObj).map((d: any) => d?.date).filter(Boolean) as string[];
  if (rawDates.length === 0 || !rawDates[0]) return 'Akan Datang';
  
  return new Date(rawDates[0]).toLocaleDateString('id-ID', { 
     day: 'numeric', month: 'long', year: 'numeric' 
  });
};

const getDayName = (dateObj: any) => {
  if (!dateObj) return '-';
  const rawDates = Object.values(dateObj).map((d: any) => d?.date).filter(Boolean) as string[];
  if (rawDates.length === 0 || !rawDates[0]) return '-';
  
  return new Date(rawDates[0]).toLocaleDateString('id-ID', { weekday: 'long' });
};

const getTimeRange = (dateObj: any) => {
  if (!dateObj) return '-';
  const first = Object.values(dateObj)[0] as any;
  if (!first) return '-';
  const s = first.start_time?.substring(0,5) || '??';
  const e = first.end_time?.substring(0,5) || '??';
  return `${s} - ${e} WIB`;
};

const handleRegisterClick = () => {
  if (!isLoggedIn.value) {
    Swal.fire({
        icon: 'info',
        title: 'Login Diperlukan',
        text: 'Mohon login terlebih dahulu untuk mendaftar.',
        showCancelButton: true,
        confirmButtonText: 'Login Sekarang',
        cancelButtonText: 'Nanti',
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-4 border-0 shadow-lg p-4',
          title: 'fs-5 fw-bold text-dark mb-2',
          htmlContainer: 'text-muted small mb-4',
          confirmButton: 'btn btn-primary rounded-pill px-4 ms-2 shadow-sm fw-medium',
          cancelButton: 'btn btn-light rounded-pill px-4 text-muted fw-medium'
        },
      }).then((result) => {
        if (result.isConfirmed) {
           router.push('/login');
        }
      });
  } else {
    router.push(`/dauroh/register/${daurohSK}`);
  }
};
</script>

<style scoped>
.font-blog {
  font-family: 'Georgia', 'Times New Roman', serif;
}
.font-blog h1, .font-blog h2, .font-blog h3, .font-blog h4, .font-blog h5, .font-blog h6, 
.font-blog .btn, .font-blog .badge, .font-blog .ls-1, .font-blog .x-small, .font-blog small, 
.font-blog .card-body, .font-blog .nav-link, .font-blog .card-header {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.bg-soft-gray { background-color: #f8f9fa; }
.text-light-gray { color: #ddd; }
.ls-1 { letter-spacing: 1px; }
.x-small { font-size: 0.75rem; }

.aspect-ratio-box {
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: #f8f9fa;
    padding: 1rem;
}

.img-poster {
    max-width: 100%;
    height: auto;
    max-height: 450px; 
    object-fit: contain; 
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

/* QUILL CONTENT STYLING */
:deep(.blog-body) {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #212529;
}
:deep(.blog-body img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 2rem auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
:deep(.blog-body p) { margin-bottom: 1.5rem; }
:deep(.blog-body ul), :deep(.blog-body ol) { padding-left: 1.5rem; margin-bottom: 1.5rem; }
:deep(.blog-body li) { margin-bottom: 0.5rem; }
:deep(.blog-body h2) { font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.6rem; }

.transition-transform { transition: transform 0.2s; }
.transition-transform:hover { transform: translateY(-2px); }
</style>