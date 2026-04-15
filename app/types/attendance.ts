export interface AttendanceParticipant {
  name: string;
  ticketId: string;
  gender: 'l' | 'p';
  age: number;
  scanTime: string | null; 
  status: 'hadir' | 'belum';
}