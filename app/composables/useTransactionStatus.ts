import dayjs from 'dayjs';

export const useTransactionStatus = () => {
  const getSmartStatus = (item: any) => {
    const dbStatus = (item.Status || item.status || '').toUpperCase();
    if (['PAID', 'SUCCESS', 'SETTLED', 'SUCCESSFUL'].includes(dbStatus)) return 'SUCCESSFUL';
    if (['CANCELLED', 'FAILED'].includes(dbStatus)) return 'CANCELLED';
    if (dbStatus === 'EXPIRED') return 'EXPIRED';
    if (dbStatus === 'PENDING' || !dbStatus) {
      const expireTime = item.expired_date || item.Expired_Date;
      
      if (expireTime) {
        const formattedExpire = expireTime.replace(' ', 'T');
        let finalExpireDate = formattedExpire;
        if (!finalExpireDate.includes('+') && !finalExpireDate.endsWith('Z')) {
          finalExpireDate += '+07:00';
        }

        const isPast = new Date(finalExpireDate).getTime() < new Date().getTime();
        
        if (isPast) return 'EXPIRED';
      }
      
      return 'PENDING';
    }

    return dbStatus;
  };

  return { getSmartStatus };
};