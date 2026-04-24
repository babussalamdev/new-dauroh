import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserMenuStore = defineStore('userMenu', () => {
  // STATE
  const menus = ref([
    { title: 'Dashboard', icon: 'bi-speedometer2', url: '/admin' },
    { title: 'Presensi Peserta', icon: 'bi-clipboard-check-fill', url: '/admin/kehadiran' },
    {
      title: 'Manajemen Event',
      icon: 'bi-archive-fill',
      subMenus: [
        { title: 'Event', url: '/admin/events' },
        { title: 'Booth', url: '/admin/booths' },
        { title: 'Voucher', url: '/admin/vouchers' },
        { title: 'Artikel', url: '/admin/artikel' }
      ]
    },
    {
      title: 'Keuangan',
      icon: 'bi-cash-coin',
      subMenus: [
        { title: 'Ringkasan Pendapatan', url: '/admin/finance' },
        { title: 'Data Transaksi', url: '/admin/finance/transactions' },
        { title: 'Laporan & Export', url: '/admin/finance/reports' }
      ]
    },
    {
      title: 'Pengaturan',
      icon: 'bi-gear-fill',
      subMenus: [
        { title: 'Manajemen User', url: '/admin/users' },
        { title: 'Control Role', url: '/admin/settings/roles' },
        { title: 'Control Menu', url: '/admin/settings/menus' }
      ]
    }
  ]);

  // ACTION
  function setMenus(newMenus: any[]) {
    menus.value = newMenus;
  }

  // ACTION
  function resetStore() {
    menus.value = [];
  }

  return { 
    menus, 
    setMenus, 
    resetStore 
  };
});