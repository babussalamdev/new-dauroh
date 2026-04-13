import { useUserStore } from "~/stores/user";
import { useAdminUserStore } from "~/stores/adminUser";

export const useAuth = () => {
  const loading = useLoading();
  const userStore = useUserStore();
  const adminUserStore = useAdminUserStore();

  const accessToken = useCookie("AccessToken", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });

  const user = useState<any>("auth_user", () => null);
  const router = useRouter();
  const { $apiBase } = useNuxtApp();

  const adminRoles = [
    "root",
    "super_role",
    "super role",
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
      if (process.client) {
        localStorage.setItem("IdToken", res.data.IdToken);
        localStorage.setItem("RefreshToken", res.data.RefreshToken);
        sessionStorage.setItem("loginType", type);
      }

      await getUser();

      if (type === "admin") {
        const userRole = (
          user.value?.role ||
          user.value?.Series ||
          ""
        ).toLowerCase();

        if (!adminRoles.includes(userRole)) {
          accessToken.value = null;
          if (process.client) {
            localStorage.removeItem("IdToken");
            localStorage.removeItem("RefreshToken");
          }
          user.value = null;

          throw new Error(
            "Akses Ditolak: Akun Anda tidak memiliki otoritas Admin.",
          );
        }
        await router.push("/admin");
      } else {
        await router.push("/dashboard");
      }
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fungsi Logout
   */
const logout = async () => {
    loading.value = true;

    try {
      const loginType = process.client
        ? sessionStorage.getItem("loginType")
        : null;

      // --- 1. CLEANUP WEBSOCKET (Mencegah WS Error saat reload) ---
      if (process.client) {
        const { $socket } = useNuxtApp() as any;
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
          console.warn(
            "API Signout gagal, tetap melanjutkan pembersihan lokal.",
          );
        }
      }

      // --- 2. CLEAR SESSION & TOKENS ---
      accessToken.value = null;
      if (process.client) {
        localStorage.removeItem("IdToken");
        localStorage.removeItem("RefreshToken");
        sessionStorage.removeItem("loginType");
      }

      user.value = null;

      // --- 3. HARD REDIRECT (Paling Aman buat Security & Hapus State Pinia) ---
      const targetPath = loginType === "admin" ? "/admin/login" : "/auth";
      
      if (process.client) {
        // Pake window.location.href biar browser ke-refresh total.
        // Semua sisa state di Pinia bakal otomatis kehapus dari memori.
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
    const loginType = process.client
      ? sessionStorage.getItem("loginType")
      : null;
    return hasAdminRole && loginType === "admin";
  });

  const isLoggedIn = computed(
    () => !!user.value?.name || !!user.value?.fullname,
  );

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
