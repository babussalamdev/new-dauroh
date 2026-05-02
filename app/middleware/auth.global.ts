export default defineNuxtRouteMiddleware(async (to) => {
  const { accessToken, user, isAdmin, getUser } = useAuth();
  
  if (accessToken.value && !user.value) {
    try {
      await getUser();
    } catch (error) {
      accessToken.value = null;
    }
  }

  const userRole = (user.value?.role || user.value?.Series || "").toLowerCase();

  // 1. Proteksi Rute Admin
  if (to.path.startsWith('/admin')) {
    if (to.path === '/admin/login' && isAdmin.value) {
      return navigateTo('/admin');
    }
    
    // Izinkan jika punya role admin (root, admin, bendahara, registrasi)
    if (to.path !== '/admin/login' && !isAdmin.value) {
      return navigateTo('/admin/login');
    }
  }

  // 2. Proteksi Rute User (Dashboard, Profile, dll)
  const userOnlyPaths = ['/dashboard', '/profile', '/history'];
  if (userOnlyPaths.some(path => to.path.startsWith(path))) {
    if (!accessToken.value) {
      return navigateTo('/auth');
    }

    // Cegah Root & Admin masuk ke halaman user
    // Kecuali role 'registrasi', boleh lewat.
    const restrictedAdminRoles = ["root", "admin", "bendahara"];
    if (restrictedAdminRoles.includes(userRole) && to.path.startsWith('/dashboard')) {
      return navigateTo('/admin'); // Tendang balik ke admin
    }
  }
});