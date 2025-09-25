import axios from 'axios'
import Swal from 'sweetalert2'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const router = useRouter()

  const api = axios.create({
    baseURL: runtimeConfig.public.apiBase,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Interceptor untuk menambahkan token ke setiap request secara otomatis
  api.interceptors.request.use((config) => {
    const accessToken = useCookie('accessToken')
    if (accessToken.value) {
      config.headers.Authorization = `Bearer ${accessToken.value}`
    }
    return config
  })

  // Interceptor untuk menangani error secara global
  api.interceptors.response.use(
    response => response,
    (error) => {
      // Jika token expired/tidak valid (error 401)
      if (error.response && error.response.status === 401) {
        const accessToken = useCookie('accessToken')
        accessToken.value = null // Hapus token yang salah
        
        Swal.fire({
          title: 'Sesi Habis',
          text: 'Silakan login kembali.',
          icon: 'warning',
          confirmButtonText: 'Login',
        }).then(() => {
          router.push('/login')
        })
      }
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api: api,
    },
  }
})