import { useDaurohStore } from '~/stores/dauroh';

export const useTransactionStatus = () => {
  const daurohStore = useDaurohStore();

  const getSmartStatus = (transaction: any) => {
    // 1. Validasi Object
    if (!transaction) return 'UNKNOWN';

    // 2. Ambil Status Asli (Prioritas Utama)
    const rawStatus = transaction.status || transaction.Status;
    
    // Kalau statusnya EXPIRED, PAID, FAILED, CANCELLED -> Ikutin aja apa kata backend
    if (rawStatus && rawStatus !== 'PENDING') {
        return rawStatus;
    }

    // 3. Logic Tambahan Cuma Buat 'PENDING'
    // Cek apakah Event-nya masih ada di database? (Ghost Event Check)
    // Kalau event udah dihapus admin, status PENDING jadi gak valid (CANCELLED)
    const sk = transaction.SK || transaction.sk || '';
    if (sk && daurohStore.tiketDauroh.length > 0) {
        const eventSK = sk.split('#')[0];
        const isEventAlive = daurohStore.tiketDauroh.some((ev: any) => ev.SK === eventSK);
        if (!isEventAlive) {
            return 'CANCELLED'; 
        }
    }

    // 4. Kalau Event masih ada, dan status DB 'PENDING' -> Ya berarti PENDING.
    // (Kita hapus logic hitung tanggal 24 jam di sini, biar sesuai "Data Asli")
    return 'PENDING';
  };

  return { getSmartStatus };
};