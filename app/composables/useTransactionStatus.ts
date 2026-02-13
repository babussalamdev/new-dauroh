import dayjs from 'dayjs';

export const useTransactionStatus = () => {
  const getSmartStatus = (transaction: any) => {
    if (!transaction) return 'UNKNOWN';
    const rawStatus = (transaction.Status || transaction.status || 'PENDING').toUpperCase();
    if (['PAID', 'SUCCESS', 'DONE', 'ACTIVE', 'CHECKED_IN'].includes(rawStatus)) {
      return 'PAID';
    }
    const expDateRaw = transaction.Expired_Date || transaction.expired_date;

    if (expDateRaw && expDateRaw !== '-') {
      const now = dayjs();
      const formattedExp = String(expDateRaw).trim().replace(' ', 'T');
      const expTime = dayjs(formattedExp);

      if (expTime.isValid()) {
        if (now.isAfter(expTime)) {
          return 'CANCELLED'; 
        }
        return 'PENDING';
      }
    }
    return rawStatus;
  };

  return { getSmartStatus };
};