<template>
  <nav aria-label="breadcrumb" class="app-breadcrumb">
    <ol class="breadcrumb">
      <li 
        v-for="(item, index) in items" 
        :key="index" 
        class="breadcrumb-item"
        :class="{ 'active': index === items.length - 1 }"
        :aria-current="index === items.length - 1 ? 'page' : undefined"
      >
        <NuxtLink v-if="index < items.length - 1" :to="item.to">
          <i v-if="item.icon" :class="item.icon"></i>
          {{ item.text }}
        </NuxtLink>
        <span v-else>
          <i v-if="item.icon" :class="item.icon"></i>
          {{ item.text }}
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
    // Format: [{ text: 'Home', to: '/admin', icon: 'bi bi-house' }, { text: 'Current Page' }]
  }
});
</script>
