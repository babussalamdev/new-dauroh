<template>
  <div class="container mt-0">
    <div
      v-if="!daurohStore.loading.tiketDauroh && daurohStore.tiketDaurohChunks.length > 0"
      id="tiketDauroh"
      class="carousel slide carousel-dark"
      data-bs-ride="carousel"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false">
      <div class="carousel-inner">
        <div v-for="(chunk, chunkIndex) in daurohStore.tiketDaurohChunks" :key="chunkIndex" :class="['carousel-item', { active: chunkIndex === 0 }]">
          <div class="d-flex card-container-flex">
            <div v-for="dauroh in chunk" :key="dauroh.sk || dauroh.Title" class="dauroh-card-wrapper">
              
              <a :href="'/dauroh/' + dauroh.sk" @click.prevent="openImageModal(dauroh)" class="text-decoration-none d-block h-100">
                <div class="card dauroh-card rounded-lg overflow-hidden h-100">
                  <div class="position-relative">
                    <img :src="`${imgUrl}/${dauroh.sk}/${dauroh.Picture}.webp`" class="card-img-top" :alt="dauroh.Title" />
                    <span v-if="dauroh.topOverlay" class="overlay-top">{{ dauroh.topOverlay }}</span>
                  </div>
                  <div class="card-body d-flex flex-column p-3">
                    <h6 class="card-title fw-bold text-dark">{{ dauroh.Title }}</h6>
                    <small class="text-muted mb-1">{{ dauroh.date || dauroh.genre }}</small>
                    <small v-if="dauroh.kuota" class="text-muted mb-2">Kuota: {{ dauroh.kuota }}</small>
                    <div class="mt-auto d-flex flex-column flex-sm-row gap-2">
                      
                      <button class="btn btn-sm btn-outline-primary rounded-pill w-100" @click.prevent.stop="openDetailModal(dauroh)">Detail</button>
                      
                      <button class="btn btn-sm btn-primary rounded-pill w-100" @click.prevent.stop="handleRegisterClick(dauroh)">Daftar</button>
                    
                    </div>
                  </div>
                </div>
              </a>

            </div>
          </div>
        </div>
      </div>
      <button
        v-if="daurohStore.tiketDaurohChunks.length > 1"
        class="carousel-control-prev"
        type="button"
        data-bs-target="#tiketDauroh"
        data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button
        v-if="daurohStore.tiketDaurohChunks.length > 1"
        class="carousel-control-next"
        type="button"
        data-bs-target="#tiketDauroh"
        data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>

    <div v-else-if="daurohStore.loading.tiketDauroh" class="skeleton-container">
      <div class="d-flex card-container-flex placeholder-glow">
        <div v-for="n in 4" :key="n" class="dauroh-card-wrapper">
          <div class="card dauroh-card rounded-lg overflow-hidden h-100">
            <div class="card-img-top placeholder" style="aspect-ratio: 2 / 3"></div>
            <div class="card-body d-flex flex-column p-3">
              <h6 class="card-title placeholder col-9"></h6>
              <small class="placeholder col-6"></small>
              <div class="mt-auto d-flex flex-column flex-sm-row gap-2">
                <a href="#" tabindex="-1" class="btn btn-sm btn-outline-primary rounded-pill w-100 disabled placeholder col-6"></a>
                <a href="#" tabindex="-1" class="btn btn-sm btn-primary rounded-pill w-100 disabled placeholder col-6"></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!daurohStore.loading.tiketDauroh && daurohStore.tiketDauroh.length === 0" class="text-center py-5">
      <h5 class="text-muted">Tidak ada dauroh yang tersedia saat ini</h5>
      <p v-if="daurohStore.searchQuery">Coba gunakan kata kunci pencarian yang lain.</p>
    </div>

    <ModalsDaurohDetailModal :show="showDetailModal" :dauroh="selectedDauroh" @close="closeDetailModal" @register="handleRegisterFromDetail" />
    
    <ModalsDaurohImageModal :show="showImageModal" :dauroh="selectedDauroh" @close="closeImageModal" />

    <ModalsDaurohRegistrationModal
      :show="showRegistrationModal"
      :dauroh="selectedDauroh"
      @close="closeRegistrationModal"
      @submit="handleRegistrationSubmit" />
    <ModalsQrCodeModal :show="showQrModal" @close="closeQrModal" />
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useDaurohStore } from "~/stores/dauroh";
  import { useUserStore } from "~/stores/user";
  import { useToastStore } from '~/stores/toast'; // * 1. Import toast store
  import { useAuth } from "~/composables/useAuth";

  // Import modal gambar baru
  import ModalsDaurohImageModal from '~/components/modals/DaurohImageModal.vue';

  const isHovered = ref(false);
  const daurohStore = useDaurohStore();
  const userStore = useUserStore();
  const toastStore = useToastStore(); // * 2. Inisialisasi store
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const imgUrl = ref("");

  const config = useRuntimeConfig();

  onMounted(() => {
    // load env value
    imgUrl.value = config.public.img;
    // Panggil fetch data
    daurohStore.fetchPublicTiketDauroh();
  });

  const selectedDauroh = ref(null);
  const showDetailModal = ref(false);
  const showRegistrationModal = ref(false);
  const showQrModal = ref(false);

  // State dan handler untuk modal gambar baru
  const showImageModal = ref(false);
  const openImageModal = (dauroh) => {
    selectedDauroh.value = dauroh;
    showImageModal.value = true;
  };
  const closeImageModal = () => {
    showImageModal.value = false;
  };
  // --- Akhir Revisi Modal Gambar ---

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
  
  const handleRegisterClick = (dauroh) => {
    if (!isLoggedIn.value) {
      // * 3. Ganti router.push dengan toast
      toastStore.showToast({
        message: 'Mohon login atau daftar terlebih dahulu.',
        type: 'info'
      });
    } else {
      selectedDauroh.value = dauroh;
      showRegistrationModal.value = true;
    }
  };

  const closeRegistrationModal = () => {
    showRegistrationModal.value = false;
  };
  const handleRegistrationSubmit = (registrationData) => {
    closeRegistrationModal();
    userStore.registerDauroh(registrationData);
    showQrModal.value = true;
  };
  const closeQrModal = () => {
    showQrModal.value = false;
  };
</script>

<style scoped>
  /* Style tidak berubah */
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
  }
  .dauroh-card-wrapper {
    flex: 0 0 auto;
    width: calc(50% - 0.75rem);
    margin-bottom: 1rem;
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
    left: 5px;
  }
  .carousel-control-next {
    left: auto;
    right: 5px;
  }
  @media (max-width: 991.98px) {
    .carousel-control-prev,
    .carousel-control-next {
      display: none;
    }
    .carousel {
      padding-left: 0;
      padding-right: 0;
    }
    .card-container-flex {
      padding: 0 1rem;
    }
  }
  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    background-size: 60%;
  }
  .card.dauroh-card {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    border: none;
    cursor: pointer;
    height: 100%;
  }
  .card.dauroh-card:hover {
    transform: translateY(-5px);
  }
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
  .card-body {
    flex-grow: 1;
  }
  .card-body .btn {
    font-size: 0.8rem;
    padding: 0.25rem 0.75rem;
  }
  .skeleton-container .dauroh-card-wrapper {
    width: calc(50% - 0.75rem);
  }
  @media (min-width: 768px) {
    .skeleton-container .dauroh-card-wrapper {
      width: calc(33.333% - (1rem * 2 / 3) - 4px);
    }
  }
  @media (min-width: 992px) {
    .skeleton-container .dauroh-card-wrapper {
      width: calc(25% - (1rem * 3 / 4) - 4px);
    }
  }
  .skeleton-container .card.dauroh-card {
    height: 100%;
  }
  .placeholder {
    background-color: #e9ecef;
  }
  .card-img-top.placeholder {
    width: 100%;
  }
</style>