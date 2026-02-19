import { useCheckoutStore } from "~/stores/checkout";

export default defineNuxtPlugin((nuxtApp) => {
  let socket: WebSocket | null = null;
  let reconnectTimeout: any = null;

  const connectWebSocket = (wsUrl: string) => {
    if (!process.client) return;
    if (!wsUrl || !wsUrl.includes("sk=")) {
      console.warn("⚠️ WS URL tidak valid atau parameter 'sk' hilang.");
      return;
    }

    // 2. Proteksi Double Connection
    if (socket) {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        console.log("ℹ️ WS sudah aktif atau sedang menyambung.");
        return;
      }
      socket.close();
    }

    try {
      console.log("🔌 Menginisialisasi WS...");
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("✅ WS Connected");
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
      };

      socket.onmessage = (event) => {
        try {
          if (!event.data) return;
          const checkOut = useCheckoutStore();        
          checkOut.setStep('success');
        } catch (error) {
          console.error("❌ WS Message Error:", error);
        }
      };

      socket.onclose = (event) => {
        if (event.code !== 1000 && event.code !== 1001) {
          console.warn(`⚠️ WS Terputus (Code: ${event.code}). Mencoba menyambung ulang dalam 5 detik...`);          
          reconnectTimeout = setTimeout(() => {
            connectWebSocket(wsUrl);
          }, 5000);
        } else {
          console.log("🔌 WS ditutup secara normal.");
        }
        socket = null;
      };

      socket.onerror = (err) => {
        if (socket?.readyState === WebSocket.CLOSING || socket?.readyState === WebSocket.CLOSED) {
          return;
        }
        console.error("❌ WS Error detected:", err);
      };

    } catch (e) {
      console.error("❌ Gagal membuat instance WebSocket:", e);
    }
  };

  const closeWebSocket = () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (socket) {
      socket.close(1000, "Normal Closure");
      socket = null;
      console.log("🔌 WS manual close dipanggil.");
    }
  };

  if (process.client) {
    window.addEventListener('beforeunload', closeWebSocket);
  }

  return {
    provide: {
      connectSocket: connectWebSocket,
      closeSocket: closeWebSocket,
      getSocket: () => socket
    },
  };
});