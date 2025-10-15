export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, isAdmin, getUser, logout } = useAuth();

  // 1. Selalu coba pulihkan sesi jika state user kosong dan ada token
  if (!isLoggedIn.value && process.client) {
    const token = localStorage.getItem("IdToken");
    if (token) {
      try {
        // untuk bagian integrasi be nya: Coba ambil data user menggunakan token yang tersimpan
        await getUser(); // Jika berhasil, isLoggedIn akan menjadi true
      } catch {
        // Jika token tidak valid/kadaluwarsa, lakukan logout paksa untuk membersihkan semuanya.
        await logout();
        return; // Hentikan middleware karena logout akan mengarahkan ke halaman login.
      }
    }
  }

  // 2. Tentukan halaman publik
  const publicPages = ["/", "/login", "/register", "/admin/login"];
  const isPublicPage = publicPages.includes(to.path);

  // 3. Lindungi halaman yang tidak publik
  if (!isPublicPage) {
    // Jika setelah mencoba memulihkan sesi, user tetap tidak login,
    // maka arahkan ke halaman login.
    if (!isLoggedIn.value) {
      return navigateTo("/login");
    }
  }

  // 4. Lindungi halaman admin secara spesifik
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!isAdmin.value) {
      // Jika user bukan admin, lempar ke dashboard user biasa.
      return navigateTo('/dashboard'); 
    }
  }
});