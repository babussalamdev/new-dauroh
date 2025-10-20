<template>
  <div class="container mt-0">
    <div
    v-if="!daurohStore.loading.tiketDauroh && daurohStore.tiketDaurohChunks.length > 0"
      id="tiketDauroh"
      class="carousel slide carousel-dark"
      data-bs-ride="carousel"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <div class="carousel-inner">
        <div
          v-for="(chunk, chunkIndex) in daurohStore.tiketDaurohChunks"
          :key="chunkIndex"
          :class="['carousel-item', { active: chunkIndex === 0 }]"
        >
          <div class="row g-3 justify-content-center">
            <NuxtLink
              :to="'/dauroh/' + dauroh.id"
              v-for="dauroh in chunk"
              :key="dauroh.id || dauroh.Title"
              class="col-6 col-md-3 mb-4 text-decoration-none"
            >
              <div class="card dauroh-card rounded-lg overflow-hidden h-100">
                <div class="position-relative">
                  <img :src="dauroh.poster" class="card-img-top" :alt="dauroh.Title" />
                  <span v-if="dauroh.topOverlay" class="overlay-top">{{ dauroh.topOverlay }}</span>
                </div>
                <div class="card-body d-flex flex-column p-3">
                  <h6 class="card-title fw-bold text-dark">{{ dauroh.Title }}</h6>
                  <small class="text-muted mb-1">{{ dauroh.date || dauroh.genre }}</small>
                  <small v-if="dauroh.kuota" class="text-muted mb-2">Kuota: {{ dauroh.kuota }}</small>
                  <div class="mt-auto d-flex flex-column flex-sm-row gap-2">
                    <button
                      class="btn btn-sm btn-outline-primary rounded-pill w-100"
                      @click.prevent="openDetailModal(dauroh)"
                    >
                      Detail
                    </button>
                    <button
                      class="btn btn-sm btn-primary rounded-pill w-100"
                      @click.prevent="handleRegisterClick(dauroh)"
                    >
                      Daftar
                    </button>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="daurohStore.loading.tiketDauroh" class="skeleton-container">
      <div class="row g-3 justify-content-center">
        <div v-for="n in 4" :key="n" class="col-6 col-md-3 mb-4">
          <div class="card dauroh-card rounded-lg overflow-hidden h-100 placeholder-glow">
            <div class="card-img-top placeholder" style="aspect-ratio: 2 / 3;"></div>
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

    <div v-else class="text-center py-5">
      <h5 class="text-muted">Tidak ada dauroh yang tersedia saat ini</h5>
      <p v-if="daurohStore.searchQuery">Coba gunakan kata kunci pencarian yang lain.</p>
    </div>

    <ModalsDaurohDetailModal
      :show="showDetailModal"
      :dauroh="selectedDauroh"
      @close="closeDetailModal"
      @register="handleRegisterFromDetail"
    />
    <ModalsDaurohRegistrationModal
      :show="showRegistrationModal"
      :dauroh="selectedDauroh"
      @close="closeRegistrationModal"
      @submit="handleRegistrationSubmit"
    />
    <ModalsQrCodeModal
      :show="showQrModal"
      @close="closeQrModal"
    />
  </div>
</template>

<script setup>
// ===== TAMBAHKAN onMounted =====
import { ref, onMounted } from "vue";
import { useDaurohStore } from "~/stores/dauroh";
import { useUserStore } from "~/stores/user";
import { useAuth } from '~/composables/useAuth';

const isHovered = ref(false);
const daurohStore = useDaurohStore();
const userStore = useUserStore();
const { isLoggedIn } = useAuth();
const router = useRouter();

const selectedDauroh = ref(null);
const showDetailModal = ref(false);
const showRegistrationModal = ref(false);
const showQrModal = ref(false);

// ===== TAMBAHKAN BAGIAN INI =====
onMounted(() => {
  // Ini untuk mencegah data di-fetch ulang jika sudah ada
  if (daurohStore.tiketDauroh.length === 0) {
    daurohStore.fetchTiketDauroh();
  }
});
// ===================================

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
    router.push('/login');
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
.carousel {
  position: relative;
}
.carousel-inner {
  overflow: visible;
  padding: 60px; /* Padding untuk layar besar */
  overflow-x: hidden;
}
@media (max-width: 768px) {
  .carousel-inner {
    padding: 15px;
  }
  .carousel-control-prev,
  .carousel-control-next {
    display: none;
  }
}
.card.dauroh-card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  border: none;
  cursor: pointer;
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
.carousel-control-prev,
.carousel-control-next {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 0.8;
  transition: opacity 0.3s ease;
  top: 50%;
  transform: translateY(-50%);
}
.carousel-control-prev {
  position: absolute;
}
.carousel-control-next {
  position: absolute;
}
.carousel-control-prev-icon,
.carousel-control-next-icon {
  filter: invert(1) grayscale(100);
}
@media (min-width: 375px) {
  .flex-sm-row .btn {
    width: auto;
  }
}
.placeholder {
  background-color: #e9ecef;
}
.card-img-top.placeholder {
  width: 100%;
}
</style>