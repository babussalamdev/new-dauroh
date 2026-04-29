<template>
  <nav aria-label="breadcrumb" class="mb-3">
    <ol class="breadcrumb">
      <li 
        v-for="(item, index) in items" 
        :key="index" 
        class="breadcrumb-item"
        :class="{ 'active fw-medium txt-caption text-dark': index === items.length - 1 }"
      >
        <NuxtLink 
          v-if="index < items.length - 1" 
          :to="item.to" 
          class="text-decoration-none txt-caption fw-bold text-primary"
        >
          <i v-if="item.icon" :class="`${item.icon} me-1`"></i>{{ item.text }}
        </NuxtLink>
        
        <span v-else aria-current="page">
          <i v-if="item.icon" :class="`${item.icon} me-1`"></i>{{ item.text }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    // Contoh: [{ text: 'Home', to: '/admin', icon: 'bi bi-house-door-fill' }, { text: 'Manajemen Tiket' }]
  }
});
</script>

<style scoped>
.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin: 0;
}
.breadcrumb-item a {
  text-decoration: none;
}
</style>