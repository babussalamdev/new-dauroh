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
];

export const dropdownMenuItems: DropdownMenu[] = [
  {
    id: 'collapseKonten',
    icon: 'bi-archive-fill',
    text: 'Manajemen Konten',
    items: [
      { to: '/admin', text: 'Tiket Dauroh' },
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