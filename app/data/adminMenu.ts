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
  { to: '/admin/scan', icon: 'bi-qr-code-scan', text: 'Scan Presensi' }, 
];

export const dropdownMenuItems: DropdownMenu[] = [
  {
    id: 'collapseKonten',
    icon: 'bi-archive-fill',
    text: 'Manajemen Konten',
    items: [
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
      // 1. MENU SEMUA USER (Default)
      { to: '/admin/users?type=all', text: 'Semua User' },
      
      // 2. MENU ADMIN
      { to: '/admin/users?type=admin', text: 'Data Admin' },
      
      // 3. MENU CLIENT
      { to: '/admin/users?type=client', text: 'Data Client' },
      
      // 4. MENU TAMBAH
      { to: '/admin/users/create', text: 'Tambah User Baru' },
    ]
  }
];