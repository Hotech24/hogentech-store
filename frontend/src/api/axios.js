import axios from 'axios'

// ✅ URL relative — passe par le proxy Vite (pas de CORS, pas d'IDM)
const API_BASE = '/api'

// Instance principale pour les requêtes JSON classiques
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Instance dédiée pour les téléchargements de fichiers (PDF, etc.)
export const apiDownload = axios.create({
  baseURL: API_BASE,
})

// Logique d'interception commune pour les deux instances
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
            // ✅ URL relative aussi pour le refresh
            const response = await axios.post(`${API_BASE}/auth/refresh/`, {
              refresh: refreshToken,
            })
            localStorage.setItem('access_token', response.data.access)
            
            // Mise à jour des deux instances
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

// Appliquer les interceptors aux deux instances
setupInterceptors(api)
setupInterceptors(apiDownload)

export default api