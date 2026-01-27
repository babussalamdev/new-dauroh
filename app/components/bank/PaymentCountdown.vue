<template>
  <div v-if="transactionDetails">
    <div v-if="transactionDetails.sender_bank_type !== 'wallet_account' && transactionDetails.paymentMethod !== 'wallet_account'">
      <h5 class="fw-bold text-danger" v-if="remainingTime > 0">
        {{ days }} Hari {{ hours }}:{{ minutes }}:{{ seconds }}
      </h5>
      <span v-else class="text-danger fw-bold">
        Expired a
      </span>
    </div>

    <div v-else>
      <small class="fw-bold text-dark" v-if="remainingTime > 0">
        Lakukan Pembayaran Dalam : <span class="text-danger fw-bold">
          {{ days }}D {{ hours }}:{{ minutes }}:{{ seconds }}
        </span>
      </small>
      <span v-else class="text-danger fw-bold">
        Expired b
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCheckoutStore } from '~/stores/checkout'
import { useAuth } from '~/composables/useAuth';

// Setup
const { $connectSocket, $closeSocket } = useNuxtApp() as any;
const config = useRuntimeConfig();
const checkoutStore = useCheckoutStore();
const { user } = useAuth();
const transactionDetails = computed(() => checkoutStore.transactionDetails);

// Logic Timer
const remainingTime = ref<number>(1000); 
const intervalId = ref<any>(null);

const days = computed(() => Math.floor(remainingTime.value / (1000 * 60 * 60 * 24)));
const hours = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
const minutes = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60)) / (1000 * 60)));
const seconds = computed(() => Math.floor((remainingTime.value % (1000 * 60)) / 1000));

const startTimer = () => {
  // Ambil waktu expired
  const expiryDateStr = transactionDetails.value?.expiryTime || transactionDetails.value?.expired_date;
  if (!expiryDateStr) return;

  const targetDate = new Date(expiryDateStr).getTime();
  const updateTime = () => {
    const now = new Date().getTime();
    const diff = targetDate - now;
    
    remainingTime.value = diff;

    // Jika waktu habis
    if (diff <= 0) {
      stopTimer();
      remainingTime.value = 0; // Pastikan 0 biar UI gak minus
      checkoutStore.setExpired(); // Trigger redirect di Store
    }
  };

  updateTime();

  if (remainingTime.value > 0) {
    intervalId.value = setInterval(updateTime, 1000);
  }
};

const stopTimer = () => {
  checkoutStore.setExpired();
  if (intervalId.value) clearInterval(intervalId.value);
  intervalId.value = null;
};

// Lifecycle
onMounted(() => {
  startTimer();

  // Socket Logic
  const userData = user.value as any;
  const sk = userData?.given_name || 'Guest';
  const program = userData?.profile || 'Default';
  const wsBaseUrl = config.public.websocketUrl || ''; 
  
  if (wsBaseUrl) {
    const wsUrl = `${wsBaseUrl}?sk=${sk}&program=${program}`;
    if ($connectSocket) $connectSocket(wsUrl);
  }
});

onUnmounted(() => {
  stopTimer();
  if ($closeSocket) $closeSocket();
});
</script>