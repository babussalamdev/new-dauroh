<template>
  <div class="container-fluid px-4 py-4">
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
      <div>
        <h4 class="fw-bold text-dark mb-1">Tambah Informasi Baru</h4>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><NuxtLink to="/admin" class="text-decoration-none text-muted">Dashboard</NuxtLink></li>
            <li class="breadcrumb-item"><NuxtLink to="/admin/artikel" class="text-decoration-none text-muted">Informasi</NuxtLink></li>
            <li class="breadcrumb-item active" aria-current="page">Tambah Baru</li>
          </ol>
        </nav>
      </div>
      <button class="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-medium" @click="router.back()">
        <i class="bi bi-arrow-left me-1"></i> Kembali
      </button>
    </div>

    <div class="row g-4">
      
      <div class="col-lg-4 col-xl-3">
        <div class="sticky-sidebar">
          
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
            <div class="p-3 border-bottom">
              <h6 class="fw-bold mb-0 text-dark small text-uppercase">Poster / Gambar</h6>
            </div>
            <div class="card-body p-3">
              <div class="Picture-container mx-auto position-relative rounded-3 overflow-hidden bg-light border border-dashed d-flex align-items-center justify-content-center">
                <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="Picture-preview" @error="onImageError" />
                
                <div v-else class="text-muted p-4 text-center">
                  <i class="bi bi-image fs-1 opacity-25"></i>
                  <div class="small mt-2">Pilih Gambar Utama</div>
                </div>
                
                <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" class="d-none" id="posterUploadArticle" />
              </div>
              
              <canvas ref="canvasRef" style="display: none;"></canvas>
              <div v-if="photoError" class="alert alert-danger mt-2 x-small p-2 text-center">{{ photoError }}</div>
            </div>

            <div class="d-flex gap-2 px-3 pb-3">
              <label for="posterUploadArticle" class="btn btn-sm btn-light fw-medium w-100 text-primary border">
                <i class="bi bi-camera me-2"></i> {{ previewUrl ? 'Ganti Gambar' : 'Pilih Gambar' }}
              </label>
            </div>
          </div>

          <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h6 class="fw-bold mb-3 text-dark small text-uppercase pb-2 border-bottom">Pengaturan Dasar</h6>
            
            <div class="mb-3">
              <label class="x-small text-muted mb-1 ps-1 fw-medium">Judul Informasi <span class="text-danger">*</span></label>
              <input type="text" class="form-control modern-input" v-model="form.Title" placeholder="Ketik judul artikel..." required>
            </div>

            <div>
              <label class="x-small text-muted mb-1 ps-1 fw-medium">Status Publikasi</label>
              <select v-model="form.Status" class="form-select modern-input">
                <option value="active">Dipublikasi</option>
                <option value="draft">Draft (Sembunyikan)</option>
              </select>
            </div>
          </div>

        </div>
      </div> 

      <div class="col-lg-8 col-xl-9">
        
        <section class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
          <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <i class="bi bi-file-text text-primary"></i> Isi Konten Artikel <span class="text-danger">*</span>
            </h5>
          </div>
          
          <div class="quill-wrapper bg-light">
            <div ref="editorContainer" style="height: 450px;"></div>
          </div>
          
          <div class="px-4 py-3 bg-white border-top d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-light rounded-pill px-4" @click="router.back()">Batal</button>
            <button @click="handleSaveArticle" class="btn btn-primary rounded-pill px-4 fw-bold" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
              {{ isSaving ? 'Menyimpan Data...' : 'Simpan Informasi' }}
            </button>
          </div>
        </section>

      </div> 
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
// import { useArticleStore } from '~/stores/article';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// --- CONFIG ---
definePageMeta({ layout: 'admin' });
const router = useRouter();
// const articleStore = useArticleStore();

// --- STATE FORM ---
const form = reactive({
  Title: '',
  Status: 'active',
  Description: ''
});

const isSaving = ref(false);

// --- STATE GAMBAR ---
const canvasRef = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(null);
const newPhotoBase64 = ref<string | null>(null);
const photoError = ref<string | null>(null);

// --- STATE QUILL ---
const editorContainer = ref<HTMLElement | null>(null);
let quillInstance: any = null;

// --- LOGIC: GAMBAR (WEB-P COMPRESSION) ---
const handleFileChange = (e: Event) => {
  photoError.value = null;
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { 
    photoError.value = 'File yang dipilih bukan gambar!'; 
    return; 
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64 = ev.target?.result as string;
    previewUrl.value = base64; // Tampilkan preview ori
    processWebP(base64); // Kompres ke WebP di background
  };
  reader.readAsDataURL(file);
};

const processWebP = (src: string) => {
  const img = new Image();
  img.onload = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const MAX_WIDTH = 1000;
    let { width, height } = img;

    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;
    }
    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(img, 0, 0, width, height);
    
    // Simpan hasil kompresi WebP ke variabel untuk dikirim ke API
    newPhotoBase64.value = canvas.toDataURL('image/webp', 0.8);
  };
  img.src = src;
};

const onImageError = () => previewUrl.value = null;

// --- LOGIC: QUILL EDITOR ---
const initQuill = () => {
  if (!editorContainer.value || quillInstance) return;

  quillInstance = new Quill(editorContainer.value, {
    theme: 'snow',
    placeholder: 'Tulis isi informasi/artikel di sini...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image', 'clean']
      ]
    }
  });

  // Pantau ketikan user dan masukkan ke state form.Description
  quillInstance.on('text-change', () => {
    form.Description = quillInstance.root.innerHTML;
  });
};

// --- LOGIC: SIMPAN DATA ---
const handleSaveArticle = async () => {
  // Validasi Kosong
  if (!form.Title || !form.Description || form.Description === '<p><br></p>') {
    Swal.fire('Oops!', 'Judul dan isi konten wajib diisi cuy!', 'warning');
    return;
  }

  isSaving.value = true;

  try {
    // Siapkan Payload data yang mau dikirim ke backend
    const payload = {
      Title: form.Title,
      Status: form.Status,
      Description: form.Description,
      PictureBase64: newPhotoBase64.value // null kalau admin ga upload gambar
    };

    // 🟢 TODO: Panggil fungsi store lu di sini kalau API BE udah siap
    // await articleStore.createArticle(payload);

    // Simulasi sukses
    setTimeout(() => {
      isSaving.value = false;
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Informasi Yayasan berhasil diterbitkan.',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        router.push('/admin/artikel'); // Balik ke halaman tabel
      });
    }, 1000);

  } catch (error) {
    isSaving.value = false;
    Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan data.', 'error');
  }
};

// --- LIFECYCLE ---
onMounted(() => {
  setTimeout(initQuill, 200); // Beri delay dikit biar DOM siap
});

onBeforeUnmount(() => {
  if (quillInstance) quillInstance = null;
});
</script>

<style scoped>
.sticky-sidebar {
  position: sticky;
  top: 1.5rem;
}

.Picture-container {
  height: 250px; /* Dikecilin dikit dari event biar pas di layar */
  border-radius: 12px;
}

.Picture-preview {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Biar gambar nutupin kotak */
}

.modern-input {
  border: 1px solid #dee2e6;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
}
.modern-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
}

.x-small {
  font-size: 0.75rem;
}

/* Kustomisasi Tampilan Quill biar nyambung sama Card */
:deep(.ql-container) {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  background: white;
  font-family: inherit;
  font-size: 1rem;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  background: #f8f9fa;
  border-color: #dee2e6 !important;
}

:deep(.ql-editor) {
  min-height: 400px;
}
</style>