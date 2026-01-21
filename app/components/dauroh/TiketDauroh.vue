<template>
  <div class="container mt-0">
    <div
      v-if="!daurohStore.loading.tiketDauroh && daurohStore.tiketDaurohChunks.length > 0"
      id="tiketDauroh"
      class="carousel slide carousel-dark"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <div class="carousel-inner">
        <div 
          v-for="(chunk, chunkIndex) in daurohStore.tiketDaurohChunks" 
          :key="chunkIndex" 
          :class="['carousel-item', { active: chunkIndex === 0 }]"
        >
          <div class="d-flex card-container-flex">
            <div v-for="dauroh in chunk" :key="dauroh.SK" class="dauroh-card-wrapper">
              
              <NuxtLink 
  :to="`/dauroh/${dauroh.SK}`" 
  class="text-decoration-none d-block h-100"
  :class="{ 'card-disabled': getCardStatus(dauroh).isDisabled }"
>
                <div class="card dauroh-card rounded-lg overflow-hidden h-100">
                  <div class="position-relative">
                   <NuxtImg
                     :src="`${imgUrl}/${dauroh.SK}/${dauroh.Picture}.webp`"
                     class="card-img-top"
                     :alt="dauroh.Title"
                     loading="lazy"
                     format="webp"
                   />
                    <span v-if="dauroh.topOverlay" class="overlay-top">{{ dauroh.topOverlay }}</span>
                    
                    <div v-if="getCardStatus(dauroh).overlayText" class="status-overlay">
                      {{ getCardStatus(dauroh).overlayText }}
                    </div>

                  </div>
                  <div class="card-body d-flex flex-column p-3">
                    <h6 class="card-title fw-bold text-dark">{{ dauroh.Title }}</h6>
                    <small class="text-muted mb-1">{{ dauroh.date || dauroh.genre }}</small>
                    
                    <div class="mt-auto d-flex flex-column flex-sm-row gap-2">
                      <button 
                        class="btn btn-sm btn-outline-primary rounded-pill w-100" 
                        @click.prevent.stop="openDetailModal(dauroh)"
                      >
                        Detail
                      </button>
                      
                      <button 
                      class="btn btn-sm rounded-pill w-100" 
                      :class="getButtonState(dauroh).cssClass"
                      :disabled="getButtonState(dauroh).disabled"
                      @click.prevent.stop="handleRegisterClick(dauroh)" 
                      >
                      {{ getButtonState(dauroh).label }}
                    </button>

                    </div>
                  </div>
                </div>
              </NuxtLink>

            </div>
          </div>
        </div>
      </div>

      <button 
        class="carousel-control-prev" 
        type="button" 
        data-bs-target="#tiketDauroh" 
        data-bs-slide="prev"
        v-show="daurohStore.tiketDaurohChunks.length > 1"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button 
        class="carousel-control-next" 
        type="button" 
        data-bs-target="#tiketDauroh" 
        data-bs-slide="next"
        v-show="daurohStore.tiketDaurohChunks.length > 1"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>

    </div>

    <ModalsDaurohDetailModal 
      :show="showDetailModal" 
      :dauroh="selectedDauroh" 
      @close="closeDetailModal" 
      @register="handleRegisterFromDetail" 
    />
    
    <ModalsDaurohImageModal 
      :show="showImageModal" 
      :dauroh="selectedDauroh" 
      @close="closeImageModal" 
    />

  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useDaurohStore } from "~/stores/dauroh";
  import { useToastStore } from '~/stores/toast';
  import { useAuth } from "~/composables/useAuth";
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import Swal from 'sweetalert2'; // Tambahkan Import Swal

  const isHovered = ref(false);
  const daurohStore = useDaurohStore();
  const toastStore = useToastStore();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const imgUrl = ref("");
  const config = useRuntimeConfig();

  onMounted(() => {
    imgUrl.value = config.public.img;
    daurohStore.fetchPublicTiketDauroh();
  });

  const selectedDauroh = ref(null);
  const showDetailModal = ref(false);
  const showImageModal = ref(false);

  // --- Modal Handlers ---
  const openImageModal = (dauroh) => {
    selectedDauroh.value = dauroh;
    showImageModal.value = true;
  };
  const closeImageModal = () => {
    showImageModal.value = false;
  };

  const openDetailModal = (dauroh) => {
    selectedDauroh.value = dauroh;
    showDetailModal.value = true;
  };
  const closeDetailModal = () => {
    showDetailModal.value = false;
  };

  const handleRegisterFromDetail = (dauroh) => {
    closeDetailModal();
    setTimeout(() => {
      handleRegisterClick(dauroh);
    }, 200);
  };

  // --- Status Tombol Terpusat ---
  const getButtonState = (daurohItem) => {
    if (!daurohItem) return { label: 'Loading...', disabled: true, cssClass: 'btn-secondary' };

    // 1. Cek Status
    if (daurohItem.Status === 'inactive') {
      return { label: 'Non-Aktif', disabled: true, cssClass: 'btn-secondary' };
    }

    const now = dayjs();

    // 2. Cek Tanggal Acara
    if (daurohItem.Date) {
       const dates = Object.values(daurohItem.Date);
       if (dates.length > 0) {
         const lastEventDateStr = dates.reduce((max, current) => (current.date > max ? current.date : max), dates[0].date);
         const eventEndTime = dayjs(`${lastEventDateStr}T23:59:59`);
         
         if (eventEndTime.isValid() && now.isAfter(eventEndTime)) {
           return { label: 'Selesai', disabled: true, cssClass: 'btn-secondary' };
         }
       }
    }

    // 3. Cek Masa Pendaftaran
    const startStr = daurohItem.Registration?.start_registration?.replace(' ', 'T');
    const endStr = daurohItem.Registration?.end_registration?.replace(' ', 'T');

    if (startStr) {
      const startRegis = dayjs(startStr);
      if (startRegis.isValid() && now.isBefore(startRegis)) {
         return { label: 'Belum Buka', disabled: true, cssClass: 'btn-secondary' };
      }
    }
    if (endStr) {
      const endRegis = dayjs(endStr);
      if (endRegis.isValid() && now.isAfter(endRegis)) {
         return { label: 'Ditutup', disabled: true, cssClass: 'btn-secondary' };
      }
    }

    // 4. Cek Kuota
    let relevantQuota = 'non-quota';
    const gender = (daurohItem.Gender || '').toLowerCase().trim();

    if (gender.includes('ikhwan') && gender.includes('akhwat')) {
      relevantQuota = daurohItem.Quota_Total;
    } else if (gender.includes('akhwat') || gender.includes('perempuan') || gender.includes('wanita')) {
      relevantQuota = daurohItem.Quota_Akhwat;
    } else if (gender.includes('ikhwan') || gender.includes('laki') || gender.includes('pria')) {
      relevantQuota = daurohItem.Quota_Ikhwan;
    } else {
      relevantQuota = daurohItem.Quota_Total;
    }

    if (relevantQuota !== 'non-quota' && Number(relevantQuota) <= 0) {
      return { label: 'Habis', disabled: true, cssClass: 'btn-secondary' };
    }

    // 5. Tombol Aktif
    return { label: 'Daftar', disabled: false, cssClass: 'btn-primary' };
  };

  const getCardStatus = (daurohItem) => {
    const buttonState = getButtonState(daurohItem);
    const label = buttonState.label;

    if (['Habis', 'Selesai', 'Ditutup', 'Non-Aktif'].includes(label)) {
      let overlayText = '';
      if (label === 'Habis') overlayText = 'SOLD OUT';
      else if (label === 'Selesai') overlayText = 'SELESAI';
      else if (label === 'Ditutup') overlayText = 'DITUTUP';
      else if (label === 'Non-Aktif') overlayText = 'NON AKTIF';

      return { isDisabled: true, overlayText: overlayText };
    }

    return { isDisabled: false, overlayText: null };
  };

  // --- REVISI DI SINI ---
  const handleRegisterClick = (daurohItem) => {
    const state = getButtonState(daurohItem);
    
    // 1. Cek Status Button
    if (state.disabled) {
       toastStore.showToast({ message: `Gagal: Status ${state.label}`, type: 'warning' });
       return;
    }

    // 2. Cek Login (Gunakan Swal agar muncul di TENGAH LAYAR)
    if (!isLoggedIn.value) {
      Swal.fire({
        icon: 'info',
        title: 'Login Diperlukan',
        text: 'Mohon login atau daftar akun terlebih dahulu.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0d6efd' // Warna biru bootstrap
      });
      return; 
    }

    // 3. Lanjut ke Registrasi
    if (daurohItem && daurohItem.SK) {
      router.push(`/dauroh/register/${daurohItem.SK}`);
    } else {
      toastStore.showToast({ message: 'Data Event tidak valid', type: 'danger' });
    }
  };
</script>

<style scoped>
  .card-disabled {
    filter: grayscale(100%);
    pointer-events: none; /* User tidak bisa klik sama sekali */
    cursor: default;
  }

  /* Tulisan overlay di tengah gambar */
  .status-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* Posisi tepat di tengah */
    
    background-color: rgba(0, 0, 0, 0.7); /* Background transparan gelap biar tulisan terbaca */
    color: white;
    padding: 8px 16px;
    border-radius: 5px;
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 1px;
    z-index: 5;
    white-space: nowrap;
    border: 2px solid white;
  }

  /* --- Style Existing --- */
  .carousel {
    position: relative;
    padding-left: 50px;
    padding-right: 50px;
  }
  .carousel-inner {
    padding: 1rem 0;
  }
  .card-container-flex {
    display: flex;
    gap: 1rem;
    padding: 0;
    overflow-x: auto;        
    scroll-behavior: smooth; 
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;   
    padding-bottom: 10px;    
  }
  .card-container-flex::-webkit-scrollbar {
    display: none;
  }

 .dauroh-card-wrapper {
  flex: 0 0 auto;
  width: 80%; 
  margin-bottom: 1rem;
  padding-right: 0;
  margin-left: auto;
  margin-right: auto;
}
  @media (min-width: 576px) {
  .dauroh-card-wrapper {
    width: calc(50% - 0.75rem);
  }
}
@media (min-width: 768px) {
  .dauroh-card-wrapper {
    width: calc(33.333% - (1rem * 2 / 3) - 4px);
  }
}

@media (min-width: 992px) {
  .dauroh-card-wrapper {
    width: calc(25% - (1rem * 3 / 4) - 4px);
    }
    .card-container-flex {
      justify-content: center;
    }
  }

  .carousel-control-prev,
  .carousel-control-next {
    width: 40px;
    height: 40px;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    opacity: 0.7;
    transition: opacity 0.3s ease;
    top: 50%;
    transform: translateY(-50%);
    position: absolute;
    z-index: 10;
    left: 0px;
  }
  .carousel-control-next {
    left: auto;
    right: 5px;
  }
  
@media (max-width: 991.98px) {
  .carousel {
    padding-left: 35px; 
    padding-right: 35px;
  }
  .carousel-control-prev { left: 0; }
  .carousel-control-next { right: 0; }
  .card-container-flex {
    padding: 0; 
    padding-bottom: 10px;
  }
}
  
  .carousel-control-prev-icon,
  .carousel-control-next-icon { background-size: 60%; }
  
  .card.dauroh-card {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    border: none;
    cursor: pointer;
    height: 100%;
  }
  .card.dauroh-card:hover { transform: translateY(-5px); }
  
  .card.dauroh-card img {
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
  }
  .overlay-top {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #0d6efd;
    color: white;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 0.75rem;
    font-weight: bold;
  }
  .card-body { flex-grow: 1; }
  .card-body .btn { font-size: 0.8rem; padding: 0.25rem 0.75rem; }
</style>