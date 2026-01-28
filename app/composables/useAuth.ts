import { useUserStore } from '~/stores/user'
import { useAdminUserStore } from '~/stores/adminUser'

export const useAuth = () => {
  const loading = useLoading()
  const userStore = useUserStore()
  const adminUserStore = useAdminUserStore()
  
  const accessToken = useCookie("AccessToken", {
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  })

  const user = useState<any>("auth_user", () => null)
  const router = useRouter()
  const { $apiBase } = useNuxtApp()

  const login = async (data: any, type: 'user' | 'admin' = 'user') => {
    loading.value = true
    try {
      const res = await $apiBase.post("signin-account", data);

      accessToken.value = res.data.AccessToken;
      localStorage.setItem("IdToken", res.data.IdToken)
      localStorage.setItem("RefreshToken", res.data.RefreshToken)

      if (process.client) {
        sessionStorage.setItem('loginType', type)
      }

      await getUser()

      // Redirect logic
      if (type === 'admin') {
        await router.push('/admin')
      } else {
        await router.push('/dashboard')
      }
    } catch (error: any) {
      throw error 
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      const loginType = process.client ? sessionStorage.getItem('loginType') : null;

      await $apiBase.post("signout-account", {
        AccessToken: localStorage.getItem("IdToken"),
      }).catch(() => {});

      accessToken.value = null
      localStorage.removeItem("IdToken")
      localStorage.removeItem("RefreshToken")
      if (process.client) {
        sessionStorage.removeItem('loginType')
      }

      user.value = null
      userStore.$reset()
      adminUserStore.$reset()

      const targetPath = loginType === 'admin' ? "/admin/login" : "/login"
      await router.push(targetPath)
      
      if (process.client) {
        window.location.reload()
      }
    } finally {
      loading.value = false
    }
  }

  const getUser = async () => {
    try {
      const res = await $apiBase.get("get-account")
      user.value = res.data
    } catch (error) {
      user.value = null
      throw error
    }
  }
  const isAdmin = computed(() => {
    const allowedRoles = ['root', 'super_role', 'admin', 'bendahara', 'registrasi'];
    const userRole = user.value?.role || user.value?.Series; // Cek kedua field jaga-jaga
    
    // Kalau role user tidak ada di daftar allowedRoles, return false
    if (!allowedRoles.includes(userRole)) return false;
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
    accessToken,
    loading
  }
}