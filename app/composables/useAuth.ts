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

  // Definisi Role Admin di sini biar bisa dipakai ulang
  const adminRoles = ['root', 'super role', 'admin', 'bendahara', 'registrasi'];

  const login = async (data: any, type: 'user' | 'admin' = 'user') => {
    loading.value = true
    try {
      const res = await $apiBase.post("signin-account", data);

      // 1. Set Token Dulu
      accessToken.value = res.data.AccessToken;
      localStorage.setItem("IdToken", res.data.IdToken)
      localStorage.setItem("RefreshToken", res.data.RefreshToken)

      if (process.client) {
        sessionStorage.setItem('loginType', type)
      }

      // 2. Ambil Data Profil User
      await getUser()
      if (type === 'admin') {
        // Cek apakah role user ada di dalam daftar adminRoles
        const userRole = (user.value?.role || user.value?.Series || '').toLowerCase();
        
        if (!adminRoles.includes(userRole)) {
           // JIKA BUKAN ADMIN:
           // 1. Hapus token (Logout paksa)
           accessToken.value = null;
           localStorage.removeItem("IdToken");
           localStorage.removeItem("RefreshToken");
           user.value = null;
           
           // 2. Lempar Error agar ditangkap catch di login.vue dan muncul alert merah
           throw new Error("Akses Ditolak: Akun Anda bukan Admin.");
        }

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
        window.location.reload() // Reload biar state bersih total
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
    const userRole = (user.value?.role || user.value?.Series || '').toLowerCase();
    
    if (!adminRoles.includes(userRole)) return false;
    
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