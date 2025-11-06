import axios from 'axios'
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#app'
import { useAuth } from '~/composables/useAuth' // Impor useAuth untuk logout

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const router = useRouter()
    
    const createApi = (baseURL: string) => {
        const instance = axios.create({
            baseURL,
        })
        
        // Interceptor ini sudah benar, tidak perlu diubah
        instance.interceptors.request.use((req) => {
            const token = localStorage.getItem('IdToken') 
            if (token) {
                req.headers.Authorization = `Bearer ${token}` 
            }
            return req
        })

        // ===== INTERCEPTOR RESPONSE DENGAN LOGIKA REFRESH TOKEN =====
        instance.interceptors.response.use(
            res => res,
            async (error) => {
                const originalRequest = error.config
                
                // Cek jika error adalah 401 (Unauthorized) dan request ini belum pernah dicoba ulang
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true // Tandai bahwa   sudah mencoba ulang
                    
                    const refreshToken = localStorage.getItem('RefreshToken') // Ambil refresh token
                    
                    if (refreshToken) {
                        try {
                            // 1. Panggil API untuk refresh token
                            // (Pastikan nama endpoint '/refresh-token' sudah benar)
                            const { data } = await instance.post('/refresh-token', { RefreshToken: refreshToken })

                            // 2. Simpan token baru yang didapat
                            localStorage.setItem('IdToken', data.IdToken)
                            localStorage.setItem('AccessToken', data.AccessToken)
                            
                            // 3. Ulangi request yang tadi gagal dengan token baru
                            originalRequest.headers.Authorization = `Bearer ${data.IdToken}`
                            return instance(originalRequest)

                        } catch (refreshError) {
                            // Jika refresh token gagal (misal, sudah kedaluwarsa juga),
                            // paksa pengguna untuk logout dan kembali ke halaman login.
                            const { logout } = useAuth()
                            await logout()
                            return Promise.reject(refreshError)
                        }
                    } else {
                        // Jika tidak ada refresh token, langsung redirect ke login
                        const { logout } = useAuth()
                        await logout()
                    }
                }
                
                return Promise.reject(error)
            }
        )
        return instance
    }

    const apiBase = createApi(config.public.apiBase)

    return {
        provide: {
            apiBase
        }
    }
})