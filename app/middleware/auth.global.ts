export default defineNuxtRouteMiddleware(async (to, from) => {
  // 1. Generate UUID (Device ID)
  if (import.meta.client) {
    let uuid = localStorage.getItem('uuid');
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem('uuid', uuid);
    }
  }

  const { accessToken, user, isAdmin, getUser, logout } = useAuth()
  const { alert: swalAlert } = useAlert();
  
  // 2. Ambil data user jika token ada tapi data belum ada
  if (accessToken.value && !user.value) {
    try {
      await getUser();
    } catch (error) {
      accessToken.value = null;
    }
  }

  // ==========================================
  // FUNGSI HELPER AUTO-REDIRECT (CUMA DI FILE INI)
  // ==========================================
  const autoRedirect = (path, doLogout = false) => {
    let isRedirecting = false;
    const execute = async () => {
      if (isRedirecting) return;
      isRedirecting = true;
     
      if (typeof document !== 'undefined') {
        const confirmBtn = document.querySelector('.swal2-confirm');
        if (confirmBtn) confirmBtn.click();
      }

      if (doLogout) await logout();
      navigateTo(path);
    };
    
  
    setTimeout(execute, 2000); 
    
    return execute;
  };

  // PROTEKSI STATUS AKUN
  if (user.value) {
    const status = (user.value?.Status || user.value?.status || "").toLowerCase();
    if (status === 'inactive' || status === 'banned' || status === 'blocked') {
      if (import.meta.client) {
        swalAlert('Akses Ditolak', 'Akun Anda telah dinonaktifkan. Silakan hubungi Admin.', 'error')
          .then(autoRedirect('/auth', true));
        return abortNavigation(); 
      }
      await logout();
      return navigateTo('/auth');
    }
  }

  const userRole = (user.value?.role || user.value?.Series || "").toLowerCase();

  // ==========================================
  // PROTEKSI RUTE ADMIN
  // ==========================================
  if (to.path.startsWith('/admin')) {
    if (to.path === '/admin/login' && isAdmin.value) {
      return navigateTo('/admin');
    }
    
    if (to.path !== '/admin/login' && !isAdmin.value) {
      if (import.meta.client && from.path !== to.path) {
        swalAlert('Sesi Berakhir', 'Sesi Anda telah habis. Silakan login kembali.', 'warning')
          .then(autoRedirect('/admin/login'));
        return abortNavigation(); 
      }
      return navigateTo('/admin/login');
    }
  }

  // ==========================================
  // PROTEKSI RUTE USER
  // ==========================================
  const userOnlyPaths = ['/dashboard', '/profile', '/history', '/event/register']; 
  if (userOnlyPaths.some(path => to.path.startsWith(path))) {
    if (!accessToken.value) {
      if (import.meta.client && from.path !== to.path) {
        swalAlert('Sesi Berakhir', 'Sesi Anda telah habis. Silakan login kembali.', 'warning')
          .then(autoRedirect('/auth'));
        return abortNavigation(); 
      }
      return navigateTo('/auth');
    }

    const restrictedAdminRoles = ["root", "admin", "bendahara"];
    if (restrictedAdminRoles.includes(userRole) && to.path.startsWith('/dashboard')) {
      return navigateTo('/admin'); 
    }
  }
});