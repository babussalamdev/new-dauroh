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
  id?: string;
  link_id?: string;
  link_url?: string;
  amount?: number;
  unique_code?: number;
  status?: string;
  title?: string;
  paymentMethod?: string;
  vaNumber?: string;
  expiryTime?: string;
  expired_date?: string; 
  sender_bank?: string;
  sender_bank_type?: string;
  
  receiver_bank_account?: {
    account_number: string;
    account_type: string;
    bank_code: string;
    account_holder: string;
  };
  
  PK?: string;
  SK?: string;
  [key: string]: any;
}

export type CheckoutStep = "select" | "summary" | "instructions" | "success";