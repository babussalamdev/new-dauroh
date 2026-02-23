export interface Participant {
  PK?: string;
  SK?: string;
  Name: string;
  Email: string;
  Gender: string;
  Age: number | string;
  Domicile: string;
}

export interface EventInfo {
  SK: string;
  Price: number;
  Title: string;
  [key: string]: any;
}

export interface TransactionDetails {
  link_id?: string;
  link_url?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  vaNumber?: string;
  expiryTime?: string;
  expired_date?: string;
  sender_bank_type?: string;
  [key: string]: any;
}

export type CheckoutStep = "select" | "summary" | "instructions" | "success";