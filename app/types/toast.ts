export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'danger' | 'info';
}