import axios from 'axios'

// ✅ Détecte automatiquement l'environnement
// En local (npm run dev) : utilise le proxy Vite → '/api'
// En production (Vercel) : utilise l'URL complète de PythonAnywhere
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiDownload = axios.create({
  baseURL: API_BASE,
})

const setupInterceptors = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE}/auth/refresh/`, {
              refresh: refreshToken,
            })
            localStorage.setItem('access_token', response.data.access)
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
            apiDownload.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
            return instance(originalRequest)
          } catch (refreshError) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }
      }
      return Promise.reject(error)
    }
  )
}

setupInterceptors(api)
setupInterceptors(apiDownload)

export default api