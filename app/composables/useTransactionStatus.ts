import { useDaurohStore } from '~/stores/dauroh';
import dayjs from 'dayjs';

export const useTransactionStatus = () => {
  const daurohStore = useDaurohStore();

  const getSmartStatus = (transaction: any) => {
    if (!transaction) return 'UNKNOWN';
    
    // 1. Ambil Status Asli
    const rawStatus = (transaction.Status || transaction.status || 'PENDING').toUpperCase();
    
    // 2. Ambil Tanggal Expired (Sesuai JSON lu: Expired_Date)
    const expDateRaw = transaction.Expired_Date || transaction.expired_date;

    // 3. SATPAM WAKTU
    if (rawStatus === 'PENDING' && expDateRaw) {
      const now = dayjs();
      // Kita tambahin .trim() biar aman dari spasi gaib
      const exp = dayjs(expDateRaw.trim());

      // Kalau jam sekarang sudah LEWAT dari jam expired
      if (exp.isValid() && now.isAfter(exp)) {
        return 'EXPIRED'; // Paksa status jadi EXPIRED di mata Frontend
      }
    }
    
    return rawStatus;
  };

  return { getSmartStatus };
};