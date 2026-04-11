interface MenuItem {
  to: string;
  icon?: string;
  text: string;
  disabled?: boolean;
}

interface DropdownMenu {
  id: string;
  icon: string;
  text: string;
  items: MenuItem[];
}

// 🟢 SCAN PRESENSI DIHAPUS DARI SINI
export const mainMenuItems: MenuItem[] = [
  { to: '/admin', icon: 'bi-speedometer2', text: 'Dashboard' },
];

export const dropdownMenuItems: DropdownMenu[] = [
  // 🟢 BIKIN KELOMPOK BARU KHUSUS PRESENSI DI PALING ATAS
{
    id: 'collapsePresensi',
    icon: 'bi-clipboard-check-fill',
    text: 'Presensi Peserta',
    items: [
      { to: '/admin/kehadiran', text: 'Data Kehadiran' }, 
    ]
  },
  {
    id: 'collapseKonten',
    icon: 'bi-archive-fill',
    text: 'Manajemen Event',
    items: [
      { to: '/admin/events', text: 'Tiket Event' }, 
      { to: '/admin/booths', text: 'Pengajuan Booth' },
      { to: '/admin/vouchers', text: 'Manajemen Voucher' },
      { to: '/admin/artikel', text: 'Artikel' }
    ]
  },
  {
    id: 'collapseUser',
    icon: 'bi-people-fill',
    text: 'Manajemen User',
    items: [
      { to: '/admin/users?type=all', text: 'Semua User' },
      { to: '/admin/users?type=admin', text: 'Data Admin' },
      { to: '/admin/users?type=client', text: 'Data Client' },
      { to: '/admin/users/create', text: 'Tambah User Baru' },
    ]
  },
  {
    id: 'collapseFinance',
    icon: 'bi-cash-coin',
    text: 'Keuangan',
    items: [
      { to: '/admin/finance/dashboard', text: 'Ringkasan Omzet' }, 
      { to: '/admin/finance/transactions', text: 'Data Transaksi' }, 
      { to: '/admin/finance/reports', text: 'Laporan & Export' }, 
    ]
  },
];