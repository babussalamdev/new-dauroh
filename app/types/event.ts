export interface EventDayDetail {
  date: string;
  start_time: string;
  end_time: string;
}

export interface EventRegistration {
  start_registration: string;
  end_registration: string;
}

export interface ApiEventRaw {
  SK: string;
  Title: string;
  Gender: string;
  Date?: { [key: string]: EventDayDetail };
  Registration?: EventRegistration;
  Place: string;
  Price: number | string;
  Quota_Ikhwan_Akhwat: number | string | null;
  Quota_Ikhwan: number | string | null;
  Quota_Akhwat: number | string | null;
  Sold_Ikhwan_Akhwat?: number | string | null;
  Sold_Ikhwan?: number | string | null;
  Sold_Akhwat?: number | string | null;
  Picture?: string;
  Status?: string;
  Description?: string;
}

export interface Event {
  SK: string | null;
  id?: number | null;
  Title: string;
  Gender: string;
  Date?: { [key: string]: EventDayDetail };
  Registration?: EventRegistration;
  Place: string;
  Price: number;
  Quota_Ikhwan: number | 'non-quota';
  Quota_Akhwat: number | 'non-quota';
  Quota_Total: number | 'non-quota';
  Sold_Ikhwan: number;
  Sold_Akhwat: number;
  Sold_Total: number;
  Picture?: string;
  Status: string;
  Description?: string;
}

export interface EventBasicData {
  SK?: string | null;
  Title: string;
  Gender: string;
  Place: string;
  Price: number;
  Registration?: EventRegistration;
  Quota_Ikhwan: number | 'non-quota';
  Quota_Akhwat: number | 'non-quota';
  Quota_Total: number | 'non-quota';
  Status: string;
  Description?: string;
}

export interface EventSchedulePayload {
  [key: string]: EventDayDetail;
}