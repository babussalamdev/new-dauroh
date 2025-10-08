<template>
  <nav aria-label="breadcrumb" class="mb-4">
    <ol class="breadcrumb">
      <li 
        v-for="(item, index) in items" 
        :key="index" 
        class="breadcrumb-item"
        :class="{ 'active': index === items.length - 1 }"
      >
        <NuxtLink v-if="index < items.length - 1" :to="item.to">{{ item.text }}</NuxtLink>
        <span v-else>{{ item.text }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    // Contoh: [{ text: 'Home', to: '/admin' }, { text: 'Manajemen Tiket' }]
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