export interface AdminUser {
  Name: string;
  SK: string;
  Series?: string;
  role?: string;
  Whatsapp?: string;
  Gender?: string;
  Status?: string;
  PK?: string;
  Birth_Date?: string;
  Username?: string;
  CreatedAt?: string;
  [key: string]: any;
}

export interface AdminUserState {
  users: AdminUser[];
  loading: boolean;
  search: string;
  perPage: number;
  currentPage: number;
  currentType: string;
}