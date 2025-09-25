<template>
  <button :class="['btn', bgClass, 'flex-column', 'align-items-center', 'p-3']" @click="handleClick" :style="buttonStyle">
    <component :is="icon" class="hero-icon mb-0" :style="{ fontSize: iconSize + 'px' }" />
    <span class="ms-2" :style="{ cursor: 'pointer' }">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  label: String,
  icon: Object,
  bgClass: String,
  iconSize: {
    type: Number,
    default: 50, // Ukuran default ikon, bisa disesuaikan
  }
})

// Menambahkan styling dinamis untuk ukuran tombol
const buttonStyle = {
  width: '70%',  // Membuat tombol lebih responsif, mengikuti lebar container
  height: '70%',  // Membuat tinggi tombol otomatis menyesuaikan konten
  maxWidth: '100px',  // Ukuran maksimal untuk tombol
  padding: 'px'  // Menjaga jarak padding tombol
}
</script>

<style scoped>
.hero-icon {
  color: #5cc6f7; /* Warna ikon */
}

button {
  border-radius: 10px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column; /* Mengatur layout agar ikon di atas dan label di bawah */
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 30%;  /* Menyesuaikan lebar tombol */
  height: 30%; /* Membuat tinggi tombol otomatis sesuai konten */
}

button:hover {
  background-color: rgba(144, 222, 241, 0.991);
}

span {
  font-size: 14px;
  color: #333;
}
</style>