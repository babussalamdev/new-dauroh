<template>
  <div v-if="transactionDetails">
    <div v-if="transactionDetails.sender_bank_type !== 'wallet_account' && transactionDetails.paymentMethod !== 'wallet_account'">
      <h5 class="fw-bold text-danger" v-if="remainingTime >= 0">
        {{ days }} Hari {{ hours }}:{{ minutes }}:{{ seconds }}
      </h5>
      <span v-else class="text-danger fw-bold">
        Expired
      </span>
    </div>

    <div v-else>
      <small class="fw-bold text-dark" v-if="remainingTime >= 0">
        Lakukan Pembayaran Dalam : <span class="text-danger fw-bold">
          {{ days }}D {{ hours }}:{{ minutes }}:{{ seconds }}
        </span>
      </small>
      <span v-else>
        Expired
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCheckoutStore } from '~/stores/checkout';
import { useAuth } from '~/composables/useAuth';

// Setup
// Gunakan 'any' pada $connectSocket untuk bypass error type check sementara
const { $connectSocket, $closeSocket } = useNuxtApp() as any;
const config = useRuntimeConfig();
const checkoutStore = useCheckoutStore();
const { user } = useAuth();

// GANTI 'payment' JADI 'transactionDetails'
const transactionDetails = computed(() => checkoutStore.transactionDetails);

// Logic Timer
const remainingTime = ref<number>(0);
const intervalId = ref<NodeJS.Timeout | null>(null);

const days = computed(() => Math.floor(remainingTime.value / (1000 * 60 * 60 * 24)));
const hours = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
const minutes = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60)) / (1000 * 60)));
const seconds = computed(() => Math.floor((remainingTime.value % (1000 * 60)) / 1000));

const startTimer = () => {
  // Cek field expiryTime ATAU expired_date (tergantung respon API Flip)
  const expiryDateStr = transactionDetails.value?.expiryTime || transactionDetails.value?.expired_date;
  
  if (!expiryDateStr) return;

  const targetDate = new Date(expiryDateStr).getTime();
  
  intervalId.value = setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;
    
    remainingTime.value = diff;

    if (diff < 0) {
      stopTimer();
      checkoutStore.setExpired();
    }
  }, 1000);
};

const stopTimer = () => {
  if (intervalId.value) clearInterval(intervalId.value);
  intervalId.value = null;
};

// Lifecycle
onMounted(() => {
  startTimer();

  // Socket
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