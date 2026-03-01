export interface UserProfile {
  fullname: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

export interface Participant {
  Name: string;
  Email?: string;
  Gender: string;
  Age?: number | string;
  Domicile?: string;
  qrCode?: string;
}

export interface UserTicket {
  SK: string;
  id?: string;
  full_sk?: string;
  date: string;
  created_at?: string;
  event?: any;
  participants: Participant[];
  title?: string;
  total_participants?: number;
  status:
  | "PENDING"
  | "SUCCESSFUL"
  | "Upcoming"
  | "EXPIRED"
  | "FAILED";
  amount?: number;
  va_number?: string;
  receiver_bank_account?: any;
  sender_bank?: string;
  expired_date?: string;
  [key: string]: any;
}