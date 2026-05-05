// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { accessToken, user, isAdmin, getUser, logout } = useAuth()
  const { alert: swalAlert } = useAlert();
  
  // 1. Ambil data user jika token ada tapi data belum ada
  if (accessToken.value && !user.value) {
    try {
      await getUser();
    } catch (error) {
      accessToken.value = null;
    }
  }

  // PROTEKSI STATUS AKUN
  if (user.value) {
    const status = (user.value?.Status || user.value?.status || "").toLowerCase();
    
    // Jika status akun tidak aktif, paksa logout
    if (status === 'inactive' || status === 'banned' || status === 'blocked') {
      await swalAlert(
        'Akses Ditolak', 
        'Akun Anda telah dinonaktifkan. Silakan hubungi Admin.', 
        'error'
      );
      
      await logout();
      return navigateTo('/auth');
    }
  }

  const userRole = (user.value?.role || user.value?.Series || "").toLowerCase();

  // Proteksi Rute Admin
  if (to.path.startsWith('/admin')) {
    if (to.path === '/admin/login' && isAdmin.value) {
      return navigateTo('/admin');
    }
    
    if (to.path !== '/admin/login' && !isAdmin.value) {
      return navigateTo('/admin/login');
    }
  }

  // Proteksi Rute User (Dashboard, Profile, dll)
  const userOnlyPaths = ['/dashboard', '/profile', '/history', '/event/register']; // Tambahin /event/register biar aman
  if (userOnlyPaths.some(path => to.path.startsWith(path))) {
    if (!accessToken.value) {
      return navigateTo('/auth');
    }

    // Cegah Root, Admin, & Bendahara masuk ke halaman dashboard user
    // Khusus role 'registrasi' tetap diizinkan lewat (Pengecualian)
    const restrictedAdminRoles = ["root", "admin", "bendahara"];
    if (restrictedAdminRoles.includes(userRole) && to.path.startsWith('/dashboard')) {
      return navigateTo('/admin'); 
    }
  }
});