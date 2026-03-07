import type { Event } from "~/types/event";

export const isNonQuota = (eventObj: Event | null | undefined) => {
  if (!eventObj) return false;
  const check = (val: any) => String(val).toLowerCase().trim() === 'non-quota';
  return check(eventObj.Quota_Total) || check(eventObj.Quota_Ikhwan) || check(eventObj.Quota_Akhwat);
};

export const getGenderLabel = (g: string | undefined) => {
  if (!g) return "Umum";
  const lower = g.toLowerCase();
  if (lower.includes('ikhwan') && lower.includes('akhwat')) return "Umum";
  if (lower.includes('ikhwan') || lower.includes('laki') || lower.includes('pria')) return "Khusus Ikhwan";
  if (lower.includes('akhwat') || lower.includes('perempuan') || lower.includes('wanita')) return 'Khusus Akhwat';
  return 'Umum';
};

export const showTotal = (eventObj: Event | null | undefined) => {
  if (!eventObj) return false;
  if (isNonQuota(eventObj)) return false;
  const g = eventObj.Gender?.toLowerCase() || '';
  return g === 'umum' || (!g.includes('ikhwan') && !g.includes('akhwat'));
};

export const showIkhwan = (eventObj: Event | null | undefined) => {
  if (isNonQuota(eventObj)) return false;
  const g = eventObj?.Gender?.toLowerCase() || '';
  return g.includes('ikhwan') || g.includes('laki') || g.includes('pria') || g.includes('ikhwan, akhwat');
};

export const showAkhwat = (eventObj: Event | null | undefined) => {
  if (isNonQuota(eventObj)) return false;
  const g = eventObj?.Gender?.toLowerCase() || '';
  return g.includes('akhwat') || g.includes('perempuan') || g.includes('wanita') || g.includes('ikhwan, akhwat');
};

export const getRemaining = (quota: number | string | undefined, sold: number | string | undefined) => {
  if (String(quota).toLowerCase() === 'non-quota') return 'Tanpa Batas';
  const q = Number(quota) || 0;
  const s = Number(sold) || 0;
  const remain = q - s;
  return remain < 0 ? 0 : remain;
};

export const formatQuota = (val: string | number) => {
  if (String(val).toLowerCase() === 'non-quota' || val === 'Tanpa Batas') return 'Tanpa Batas';
  if (val === 0 || val === '0') return '0 (Penuh)';
  return `${val}`;
};

export const totalQuotaDisplay = (eventObj: Event | null | undefined) => {
  if (!eventObj) return '-';
  if (isNonQuota(eventObj)) return 'Tanpa Batas';

  let text = [];
  if (showIkhwan(eventObj)) text.push(`Ikhwan: ${eventObj.Quota_Ikhwan}`);
  if (showAkhwat(eventObj)) text.push(`Akhwat: ${eventObj.Quota_Akhwat}`);

  if (text.length > 0) return text.join(', ');

  return `${eventObj.Quota_Total} Kursi`;
};

export const registrationStatus = (eventObj: Event | null | undefined) => {
  if (!eventObj) return { canRegister: false, message: 'Loading...' };

  if (eventObj.Status !== 'active') return { canRegister: false, message: 'Event Selesai / Tutup' };

  if (isNonQuota(eventObj)) {
    return { canRegister: true, message: 'Daftar Sekarang' };
  }

  const remTotal = getRemaining(eventObj.Quota_Total, eventObj.Sold_Total);
  const remIkhwan = getRemaining(eventObj.Quota_Ikhwan, eventObj.Sold_Ikhwan);
  const remAkhwat = getRemaining(eventObj.Quota_Akhwat, eventObj.Sold_Akhwat);

  if (
    (typeof remTotal === 'number' && remTotal > 0) ||
    (typeof remIkhwan === 'number' && remIkhwan > 0) ||
    (typeof remAkhwat === 'number' && remAkhwat > 0)
  ) {
    return { canRegister: true, message: 'Daftar Sekarang' };
  }

  return { canRegister: false, message: 'Kuota Penuh' };
};
