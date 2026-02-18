import { useCheckoutStore } from "~/stores/checkout";

export default defineNuxtPlugin((nuxtApp) => {
  let socket: WebSocket | null = null;
  
const connectWebSocket = (wsUrl: string) => {
  const checkoutStore = useCheckoutStore(); 

  // 1. PROTEKSI: Cek apakah URL valid (harus ada parameter 'sk' sesuai log error tadi)
  if (!wsUrl || !wsUrl.includes('sk=')) {
    console.warn("⚠️ WS URL tidak valid atau parameter 'sk' hilang. Koneksi dibatalkan.");
    return;
  }

  // 2. PROTEKSI: Cek jika socket sedang CONNECTING atau sudah OPEN
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log("ℹ️ WS sudah tersambung atau sedang proses menyambung.");
    return;
  }

  // 3. TUTUP: Jika ada socket lama yang statusnya 'Closing', bersihkan dulu
  if (socket) {
    socket.close();
  }

  console.log("🔌 Connecting WS to:", wsUrl);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("✅ WS Connected");
  };

  socket.onmessage = (event) => {
    try {
      // Pastikan data tidak kosong
      if (!event.data) return;

      const result = JSON.parse(event.data);
      console.log("📩 WS Message:", result);
      
      const { store, mutation, data } = result;

      // Logic update store
      if (store === 'formulir' && mutation === 'statusPayment') {
        console.log("⚡ Mengupdate status pembayaran ke store...");
        checkoutStore.updatePaymentStatus(data);
      }
      
    } catch (error) {
      // Abaikan jika pesan bukan JSON (misalnya pesan 'ping' dari server)
      console.error("❌ WS Parse Error:", error);
    }
  };

  socket.onclose = (event) => {
    console.log(`⚠️ WS Disconnected (Code: ${event.code})`);
    socket = null; // Reset variable agar bisa konek ulang nanti
  };
  
  socket.onerror = (err) => {
    console.error("❌ WS Error detect:", err);
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