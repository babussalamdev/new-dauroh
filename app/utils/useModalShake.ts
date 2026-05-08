import { ref } from 'vue';

export const useModalShake = () => {
  const isShaking = ref(false);

  const triggerShake = () => {
    isShaking.value = true;
    setTimeout(() => {
      isShaking.value = false;
    }, 300);
  };

  return { isShaking, triggerShake };
};