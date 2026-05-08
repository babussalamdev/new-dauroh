import axios from 'axios'
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#app'
import { useAuth } from '~/composables/useAuth'
import Swal from 'sweetalert2' // 🟢 Pastikan Swal sudah terinstall

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    
    const createApi = (baseURL: string) => {
        const instance = axios.create({ baseURL })

        instance.interceptors.request.use((req) => {
            const token = localStorage.getItem('IdToken') 
            if (token) {
                req.headers.Authorization = `Bearer ${token}` 
            }
            return req
        })

        // ===== INTERCEPTOR RESPONSE (HANDLING GLOBAL) =====
        instance.interceptors.response.use(
            res => res,
            async (error) => {
                const originalRequest = error.config
                const errorMessage = error.response?.data?.message || '' 
                const { logout } = useAuth() // 🟢 Ambil fungsi logout

                // 1. HANDLE TOKEN REVOKED ATAU SESSION MATI
                if ((error.response?.status === 400 || error.response?.status === 401) && errorMessage.includes("revoked")) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Sesi Berakhir',
                        text: 'Akses token Anda telah dicabut atau Anda telah login di perangkat lain. Silakan login kembali.',
                        confirmButtonColor: '#004754',
                        allowOutsideClick: false
                    }).then(async () => {
                        await logout() // 🟢 Paksa logout & pentalin ke login
                    })
                    
                    // 🟢 TRIK GLOBAL: Return Promise kosong agar blok catch di store tidak jalan
                    return new Promise(() => {}) 
                }

                // 2. LOGIKA REFRESH TOKEN
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true 
                    const refreshToken = localStorage.getItem('RefreshToken') 
                    
                    if (refreshToken) {
                        try {
                            const { data } = await axios.post(`${config.public.apiBase}/refresh-token`, { 
                                RefreshToken: refreshToken 
                            })
                            localStorage.setItem('IdToken', data.IdToken)
                            localStorage.setItem('AccessToken', data.AccessToken)
                            originalRequest.headers.Authorization = `Bearer ${data.IdToken}`
                            return instance(originalRequest)
                        } catch (refreshError) {
                            // JIKA REFRESH TOKEN GAGAL (Sesi benar-benar habis)
                            Swal.fire({
                                icon: 'warning',
                                title: 'Sesi Habis',
                                text: 'Sesi login Anda telah berakhir. Silakan login kembali.',
                                confirmButtonColor: '#004754',
                                allowOutsideClick: false
                            }).then(async () => {
                                await logout() // 🟢 Langsung pentalin
                            })
                            return new Promise(() => {}) 
                        }
                    } else {
                        // JIKA TIDAK ADA REFRESH TOKEN
                        await logout()
                        return new Promise(() => {})
                    }
                }
                
                // Kalau error biasa (misal server down atau validasi), baru lempar ke store
                return Promise.reject(error)
            }
        )
        return instance
    }

    const apiBase = createApi(config.public.apiBase)
    return { provide: { apiBase } }
})