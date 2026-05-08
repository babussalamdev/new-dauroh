<template>
  <button :class="['btn', bgClass, 'flex-column', 'align-items-center', 'p-3']" @click="handleClick">
    <Icon :name="icon" :size="iconSize" class="hero-icon" />
    <span class="ms-2 mt-2">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  label: String,
  icon: String,
  bgClass: String,
  iconSize: {
    type: Number,
    default: 50, 
  }
})
const emit = defineEmits(['click'])
const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
span {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
</style>