import { useUserMenuStore } from '~/stores/userMenu';

export const useAuth = () => {
  const loading = useLoading();

  const accessToken = useCookie("AccessToken", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });

  // COOKIE BUAT NYIMPEN TIPE LOGIN
  const loginTypeCookie = useCookie("LoginType", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });

  const user = useState<any>("auth_user", () => null);
  const router = useRouter();
  

  const nuxtApp = useNuxtApp();
  const $apiBase = (nuxtApp as any).$apiBase;

  const adminRoles = [
    "root",
    "admin",
    "bendahara",
    "registrasi",
  ];

  /**
   * Fungsi Login
   */
  const login = async (data: any, type: "user" | "admin" = "user") => {
    loading.value = true;
    try {
      const res = await $apiBase.post("signin-account", data);

      accessToken.value = res.data.AccessToken;
      loginTypeCookie.value = type;

      if (process.client) {
        localStorage.setItem("IdToken", res.data.IdToken);
        localStorage.setItem("RefreshToken", res.data.RefreshToken);
      }

      await getUser();

      // LOGIKA PEMBATASAN ROLE
      const userRole = (
        user.value?.role ||
        user.value?.Series ||
        ""
      ).toLowerCase();

      if (type === "admin") {
        if (!adminRoles.includes(userRole)) {
          await forceLogoutCleanup(); 
          throw new Error("Akses Ditolak: Anda tidak memiliki otoritas Admin.");
        }
        await router.push("/admin");
      } else {
        const restrictedAdminRoles = ["root", "admin", "bendahara"];
        
        if (restrictedAdminRoles.includes(userRole)) {
           await forceLogoutCleanup();
           throw new Error("Akun Admin/Root hanya diperbolehkan login di halaman Admin.");
        }
        
        await router.push("/");
      }
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const forceLogoutCleanup = async () => {
    accessToken.value = null;
    loginTypeCookie.value = null;
    if (process.client) {
      localStorage.removeItem("IdToken");
      localStorage.removeItem("RefreshToken");
    }
    user.value = null;
  }

  /**
   * Fungsi Logout
   */
  const logout = async () => {
    loading.value = true;

    try {
      const typeForRedirect = loginTypeCookie.value;

      // --- 1. CLEANUP WEBSOCKET ---
      if (process.client) {
        const $socket = (nuxtApp as any).$socket; 
        if ($socket && typeof $socket.close === "function") {
          console.log("🔌 Closing WebSocket connection...");
          $socket.close(1000, "Logout");
        }
      }

      // Hit API Signout
      if (process.client && localStorage.getItem("IdToken")) {
        try {
          await $apiBase.post("signout-account", {
            AccessToken: localStorage.getItem("IdToken"),
          });
        } catch (e) {
          console.warn("API Signout gagal, tetap melanjutkan pembersihan lokal.");
        }
      }

      // --- 2. CLEAR SESSION & TOKENS ---
      accessToken.value = null;
      loginTypeCookie.value = null;
      
      if (process.client) {
        localStorage.removeItem("IdToken");
        localStorage.removeItem("RefreshToken");
      }

      user.value = null;

      // --- 3. HARD REDIRECT ---
      const targetPath = typeForRedirect === "admin" ? "/admin/login" : "/auth";
      
      if (process.client) {
        window.location.href = targetPath;
      }

    } catch (error) {
      console.error("Logout fatal error:", error);
    } finally {
      loading.value = false;
    }
  };

 const getUser = async () => {
    try {
      const res = await $apiBase.get("get-account");
      user.value = res.data;
      
      if (res.data.Menus) {
        const menuStore = useUserMenuStore();
        menuStore.setMenus(res.data.Menus);
      }

      return res.data;
    } catch (error) {
      user.value = null;
      throw error;
    }
  };

  const isAdmin = computed(() => {
    if (!user.value) return false;
    const userRole = (
      user.value?.role ||
      user.value?.Series ||
      ""
    ).toLowerCase();
    
    const hasAdminRole = adminRoles.includes(userRole);
   
    return hasAdminRole && loginTypeCookie.value === "admin";
  });

  const isLoggedIn = computed(() => !!user.value);

  return {
    user,
    login,
    logout,
    getUser,
    isLoggedIn,
    isAdmin,
    accessToken,
    loading,
  };
};