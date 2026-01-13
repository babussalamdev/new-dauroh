// app/plugins/websocket.client.ts
import { useCheckoutStore } from "~/stores/checkout";

export default defineNuxtPlugin((nuxtApp) => {
  let socket: WebSocket | null = null;
  // Di Nuxt 4/3, panggil store langsung tanpa argumen $pinia biasanya lebih aman
  const checkoutStore = useCheckoutStore(); 

  const connectWebSocket = (wsUrl: string) => {
    // Cek jika socket sudah ada dan terbuka, jangan konek lagi
    if (socket && socket.readyState === WebSocket.OPEN) return;

    console.log("Connecting WS to:", wsUrl);
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WS Connected");
    };

    socket.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data);
        
        // Mapping logika lama (Vuex) ke Pinia
        const { store, mutation, data } = result;

        if (store === 'formulir' && mutation === 'statusPayment') {
          checkoutStore.updatePaymentStatus(data);
        }

      } catch (error) {
        console.error("WS Parse Error:", error);
      }
    };

    socket.onclose = () => {
      console.log("WS Disconnected");
    };
    
    socket.onerror = (err) => {
      console.error("WS Error:", err);
    }
  };

  const closeWebSocket = () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  };

  return {
    provide: {
      connectSocket: connectWebSocket,
      closeSocket: closeWebSocket,
    },
  };
});