import { useLoading } from '~/composables/useLoading'
import type { AuthUser } from '~/types/auth' 
// Swal kita hapus importnya karena kita serahkan error handling ke UI (login.vue)
// import Swal from "sweetalert2" 

export const useAuth = () => {
  const loading = useLoading()
  const accessToken = useCookie("AccessToken", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  })

  const user = useState<AuthUser | null>("auth_user", () => null)
  const router = useRouter()
  const { $apiBase } = useNuxtApp()

  const login = async (data: any, type: 'user' | 'admin' = 'user') => {
    loading.value = true
    try {
      const res = await $apiBase.post("signin-account", data);

      // simpan token
      accessToken.value = res.data.AccessToken;
      localStorage.setItem("IdToken", res.data.IdToken)
      localStorage.setItem("RefreshToken", res.data.RefreshToken)

      // Simpan tipe login ke session storage
      if (process.client) {
        sessionStorage.setItem('loginType', type)
      }

      // ambil profil
      await getUser()

      // redirect sesuai type login
      // Note: Di login.vue kamu sudah ada redirect, tapi ini gapapa dibiarkan sebagai fallback
      if (type === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }

    } catch (error: any) {
      // ❌ HAPUS SWAL DISINI (Biar gak double alert & errornya gak ketelen)
      /* Swal.fire({
        text: error.response?.data?.error || error.message || "Login gagal",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      }) 
      */

      // ✅ WAJIB: Lempar error ke luar biar ditangkap login.vue
      // Supaya popup "Verifikasi Sekarang" bisa muncul
      throw error 

    } finally {
      loading.value = false
    }
  }

  // ===== FUNGSI LOGOUT (TIDAK DIUBAH) =====
  const logout = async () => {
    try {
      await $apiBase.post("signout-account", {
        AccessToken: localStorage.getItem("IdToken"),
      })
    } catch {}
    finally {
      // 1. Ambil dulu tipe loginnya SEBELUM dihapus
      const loginType = process.client ? sessionStorage.getItem('loginType') : null;
      
      // 2. Bersihkan semua data sesi
      localStorage.removeItem("IdToken")
      localStorage.removeItem("RefreshToken")
      useCookie("AccessToken").value = null
      user.value = null
      if (process.client) {
        sessionStorage.removeItem('loginType')
      }
      
      // Arahkan ke halaman login yang sesuai
      if (loginType === 'admin') {
        router.push("/admin/login") 
      } else {
        router.push("/login") 
      }
    }
  }

  const getUser = async () => {
    try {
      const res = await $apiBase.get("get-account")
      user.value = res.data as AuthUser
    } catch (error) {
      user.value = null
      throw error
    }
  }
  
  const isAdmin = computed(() => {
    const roleIsAdmin = user.value?.role === 'admin' || user.value?.role === 'root';
    if (!roleIsAdmin) {
      return false;
    }
    const loginType = process.client ? sessionStorage.getItem('loginType') : null;
    return loginType === 'admin';
  })

  const isLoggedIn = computed(() => !!user.value?.name)
  
  return {
    user,
    login,
    logout,
    getUser,
    isLoggedIn,
    isAdmin,
    accessToken
  }
}