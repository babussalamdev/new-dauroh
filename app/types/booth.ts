export interface BoothSubmission {
  SK: string; // Harus ada ID unik dari database
  boothName: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  createdAt: string; // Sebaiknya ada timestamp
}