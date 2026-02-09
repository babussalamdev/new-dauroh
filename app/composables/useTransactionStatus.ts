import { useDaurohStore } from '~/stores/dauroh';

export const useTransactionStatus = () => {
  const daurohStore = useDaurohStore();

  const getSmartStatus = (transaction: any) => {
    if (!transaction) return 'UNKNOWN';
    const rawStatus = (transaction.status || transaction.Status || 'PENDING').toUpperCase();
    
    return rawStatus;
  };

  return { getSmartStatus };
};