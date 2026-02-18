import dayjs from 'dayjs';

export const useTransactionStatus = () => {
  const getSmartStatus = (item: any) => {
    // 1. CEK STATUS DARI DATABASE DULUAN (Prioritas Utama)
    const dbStatus = (item.Status || item.status || '').toUpperCase();
    
    if (['PAID', 'SUCCESS', 'SETTLED'].includes(dbStatus)) return 'PAID';
    if (['CANCELLED', 'FAILED', 'REFUNDED'].includes(dbStatus)) return 'CANCELLED';
    if (dbStatus === 'EXPIRED') return 'EXPIRED';

    // 2. KALAU DATABASE BILANG PENDING, BARU CEK WAKTU (Expired atau nggak)
    if (dbStatus === 'PENDING' || !dbStatus) {
      const expireTime = item.Expired_Date || item.expired_date || item.expiry_date;
      
      if (expireTime) {
        // Normalisasi format tanggal biar ga error di Safari/Mobile
        const formattedExpire = expireTime.replace(' ', 'T');
        const isPast = new Date(formattedExpire).getTime() < new Date().getTime();
        
        if (isPast) return 'EXPIRED';
      }
      
      return 'PENDING';
    }

    return dbStatus;
  };

  return { getSmartStatus };
};