import { useLoading } from '~/composables/useLoading'
import Swal from "sweetalert2"
import type { AuthUser } from '~/types/auth'  // import tipe

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
      if (type === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }

    } catch (error: any) {
      Swal.fire({
        text: error.response?.data?.error || error.message || "Login gagal",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      })
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $apiBase.post("signout-account", {
        AccessToken: localStorage.getItem("IdToken"),
      })
    } catch {}
    finally {
      localStorage.removeItem("IdToken")
      localStorage.removeItem("RefreshToken")
      useCookie("AccessToken").value = null
      user.value = null
      
      if (process.client) {
        sessionStorage.removeItem('loginType')
      }
      
      router.push("/login")
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
  
  // Logika isAdmin
  const isAdmin = computed(() => {
    const roleIsAdmin = user.value?.role === 'admin' || user.value?.role === 'root';
    if (!roleIsAdmin) {
      return false; // Jika role bukan admin, sudah pasti bukan admin session
    }
    // Jika role-nya admin, cek tipe login dari session
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
    isAdmin
  }
}