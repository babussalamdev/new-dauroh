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

// 🟢 MANAJEMEN USER DIPINDAH KE SINI BIAR JADI MENU TUNGGAL
export const mainMenuItems: MenuItem[] = [
  { to: '/admin', icon: 'bi-speedometer2', text: 'Dashboard' },
  { to: '/admin/users', icon: 'bi-people-fill', text: 'Manajemen User' }
];

export const dropdownMenuItems: DropdownMenu[] = [
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
  // 🟢 MENU COLLAPSE USER UDAH DIHAPUS DARI SINI
  {
    id: 'collapseFinance',
    icon: 'bi-cash-coin',
    text: 'Keuangan',
    items: [
      { to: '/admin/finance', text: 'Ringkasan Pendapatan' }, 
      { to: '/admin/finance/transactions', text: 'Data Transaksi' }, 
      { to: '/admin/finance/reports', text: 'Laporan & Export' }, 
    ]
  },
];