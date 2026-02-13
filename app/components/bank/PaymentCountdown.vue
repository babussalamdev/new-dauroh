<template>
  <div v-if="transactionDetails">
    <div v-if="transactionDetails.sender_bank_type !== 'wallet_account' && transactionDetails.paymentMethod !== 'wallet_account'">
      <h5 class="fw-bold text-danger" v-if="remainingTime > 0">
        {{ pad(hours) }}:{{ pad(minutes) }}:{{ pad(seconds) }}
      </h5>
      <span v-else class="text-danger fw-bold">
        Expired
      </span>
    </div>

    <div v-else>
      <small class="fw-bold text-dark" v-if="remainingTime > 0">
        Lakukan Pembayaran Dalam : <span class="text-danger fw-bold">
          {{ pad(hours) }}:{{ pad(minutes) }}:{{ pad(seconds) }}
        </span>
      </small>
      <span v-else class="text-danger fw-bold">
        Expired
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
const pad = (n: number) => n.toString().padStart(2, '0');
const hours = computed(() => Math.floor(remainingTime.value / (1000 * 60 * 60))); 
const minutes = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60)) / (1000 * 60)));
const seconds = computed(() => Math.floor((remainingTime.value % (1000 * 60)) / 1000));

const startTimer = () => {
  let expiryDateStr = transactionDetails.value?.expiryTime || transactionDetails.value?.expired_date;
  if (!expiryDateStr) return;

  // Logic Timezone (Keep this, ini penting!)
  if (typeof expiryDateStr === 'string') {
      expiryDateStr = expiryDateStr.replace(' ', 'T');
      if (!expiryDateStr.includes('+') && !expiryDateStr.endsWith('Z')) {
          expiryDateStr += '+07:00';
      }
  }

  const targetDate = new Date(expiryDateStr).getTime();
  
  if (isNaN(targetDate)) return;

  const updateTime = () => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    remainingTime.value = diff;

    if (remainingTime.value <= 0) {
      remainingTime.value = 0;
      stopTimer();
      // Buffer 2 detik sebelum trigger expired di store
      if (diff < -2000) {
         checkoutStore.setExpired();
      }
    }
  };

  updateTime();

  if (remainingTime.value > 0) {
    intervalId.value = setInterval(updateTime, 1000);
  }
};

const stopTimer = () => {
  if (intervalId.value) clearInterval(intervalId.value);
  intervalId.value = null;
};

onMounted(() => {
  startTimer();

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