// app/data/adminMenu.ts

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

export const mainMenuItems: MenuItem[] = [
  { to: '/admin', icon: 'bi-speedometer2', text: 'Dashboard' },
  // TAMBAHKAN INI:
  { to: '/admin/scan', icon: 'bi-qr-code-scan', text: 'Scan Presensi' }, 
];

export const dropdownMenuItems: DropdownMenu[] = [
  {
    id: 'collapseKonten',
    icon: 'bi-archive-fill',
    text: 'Manajemen Konten',
    items: [
      // UBAH BARIS INI: Dari '/admin' jadi '/admin/events'
      { to: '/admin/events', text: 'Tiket Dauroh' }, 
      
      { to: '/admin/booths', text: 'Pengajuan Booth' },
      { to: '/admin/vouchers', text: 'Manajemen Voucher' },
    ]
  },
  {
    id: 'collapseUser',
    icon: 'bi-people-fill',
    text: 'Manajemen User',
    items: [
      { to: '/admin/users', text: 'Semua User' },
      { to: '/admin/users/create', text: 'Tambah User Baru' },
    ]
  }
];