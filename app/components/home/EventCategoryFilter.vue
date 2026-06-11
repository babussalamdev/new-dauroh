<template>
<h1 class="display-5 txt-title text-center fw-bold text-dark">
  Event <span class="text-primary">Babussalam</span>
</h1>
  <div class="d-flex justify-content-center py-2 mb-3">
    <div class="filter-navbar shadow-sm">
      <div class="filter-btn-wrapper">
        <button 
          class="btn filter-btn"
          :class="{ active: activeCategory === 'semua' }"
          @click="selectCategory('semua')"
        >
          Semua Event
        </button>
      </div>

      <div class="filter-btn-wrapper">
        <button 
          class="btn filter-btn"
          :class="{ active: activeCategory === 'umum' }"
          @click="selectCategory('umum')"
        >
          Umum
        </button>
      </div>
      
      <div class="filter-btn-wrapper">
        <button 
          class="btn filter-btn"
          :class="{ active: activeCategory === 'ikhwan' }"
          @click="selectCategory('ikhwan')"
        >
          Khusus Ikhwan
        </button>
      </div>

      <div class="filter-btn-wrapper">
        <button 
          class="btn filter-btn"
          :class="{ active: activeCategory === 'akhwat' }"
          @click="selectCategory('akhwat')"
        >
          Khusus Akhwat
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'semua'
  }
});

const emit = defineEmits(['update:modelValue']);

const activeCategory = ref(props.modelValue);

const selectCategory = (category) => {
  activeCategory.value = category;
  emit('update:modelValue', category);
};
</script>

<style scoped>
/* Container berbentuk navbar/pill horizontal */
.filter-navbar {
  display: flex;
  background-color: #f1f3f5;
  padding: 4px;
  border-radius: 50px;
  border: 1px solid #e9ecef;
  margin: 0 auto;
  align-items: center;
}

.filter-btn-wrapper {
  flex: 1;
}

/* Tombol transparan secara default */
.filter-btn {
  width: 100%;
  border-radius: 50px;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 8px 20px;
  color: #6c757d;
  background-color: transparent;
  transition: all 0.25s ease-in-out;
  white-space: nowrap;
}

.filter-btn:hover {
  color: #495057;
}

/* Efek tombol aktif (putih menonjol) */
.filter-btn.active {
  background-color: #ffffff;
  color: var(--color-primary, #0d6efd);
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0,0,0,0.06);
}

/* Responsif Mobile: Mode Grid 2x2 */
@media (max-width: 767px) {
  .filter-navbar {
    flex-wrap: wrap;
    border-radius: 16px; /* Sudut lebih kotak buat grid */
    padding: 6px;
    max-width: 340px;
    width: 100%;
  }
  
  .filter-btn-wrapper {
    width: 50%;
    flex: 0 0 50%;
    padding: 3px;
  }
  
  .filter-btn {
    border-radius: 12px;
    padding: 8px 4px;
    font-size: 0.8rem;
  }
}
</style>
