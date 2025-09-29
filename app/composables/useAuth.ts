// composables/useAuth.ts
import Swal from "sweetalert2";

export const useAuth = () => {
  const accessToken = useCookie("AccessToken", {
    maxAge: 60 * 60 * 24, // 1 hari
    path: "/",
    sameSite: "lax",
  });
  const user = useState("auth_user", () => null);
  const loading = useState("auth_loading", () => false); // ✅ loading state
  const { $api } = useNuxtApp();

  const login = async (data: any) => {
    loading.value = true; // mulai loading
    try {
      const res = await $api.post("signin-account", data);

      // 🔍 Debug log untuk cek isi response
      console.log("LOGIN RESPONSE:", res.data);

      // ✅ Ambil token sesuai struktur API
      const AccessToken = res.data?.AccessToken || res.data?.data?.AccessToken;
      const IdToken = res.data?.IdToken || res.data?.data?.IdToken;
      const RefreshToken = res.data?.RefreshToken || res.data?.data?.RefreshToken;

      if (!AccessToken) {
        throw new Error("Error");
      }

      // Simpan token
      accessToken.value = AccessToken;
      if (IdToken) localStorage.setItem("IdToken", IdToken);
      if (RefreshToken) localStorage.setItem("RefreshToken", RefreshToken);

      await getUser();

      return await navigateTo("/");
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      if (error.response && error.response.status === 400) {
        Swal.fire({
          text: error.response.data.error,
          icon: "warning",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        Swal.fire({
          text: error.message || "Login gagal",
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } finally {
      loading.value = false; // selesai loading
    }
  };

  const logout = async () => {
    const token = useCookie("AccessToken");
    const data = { AccessToken: token.value };

    try {
      await $api.post("signout-account", data);
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      // Hapus semua data auth
      token.value = null;
      localStorage.removeItem("IdToken");
      localStorage.removeItem("RefreshToken");
      user.value = null;

      return await navigateTo("/login");
    }
  };

  const getUser = async () => {
    try {
      const res = await $api.get("get-account");
      user.value = res.data;
    } catch (error) {
      user.value = null;
      throw error;
    }
  };

  return {
    user,
    loading, // ✅ bisa dipakai di form buat loading state
    login,
    logout,
    getUser,
  };
};
