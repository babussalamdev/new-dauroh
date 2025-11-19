<template>
  <button 
    class="btn btn-sm btn-outline-secondary py-0 px-1 ms-1" 
    style="font-size: 0.75rem;" 
    @click="copyToClipboard"
    title="Salin"
  >
    <i v-if="copied" class="bi bi-check-lg text-success"></i>
    <i v-else class="bi bi-clipboard"></i>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToastStore } from '~/stores/toast';

const props = defineProps<{ text: string }>();
const toast = useToastStore();
const copied = ref(false);

const copyToClipboard = () => {
  navigator.clipboard.writeText(props.text).then(() => {
    copied.value = true;
    toast.showToast({ message: 'Disalin ke clipboard', type: 'success' });
    setTimeout(() => copied.value = false, 2000);
  });
};
</script>