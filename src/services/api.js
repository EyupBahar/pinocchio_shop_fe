import axios from 'axios'

function getTokenFromCookie(name = 'authToken') {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  for (const c of cookies) {
    const [k, v] = c.split('=')
    if (k === name) return decodeURIComponent(v)
  }
  return null
}

// Get token from storage (removed React Query cache access for security)
function getToken() {
  // Get token directly from storage (cookie or localStorage)
  // Removed window.__REACT_QUERY_CLIENT__ access for security
  return getTokenFromCookie('authToken') || localStorage.getItem('authToken')
}

// Decode JWT token
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// Check if token is expired
function isTokenExpired(token) {
  if (!token) return true
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

// Get token expiration time in milliseconds
function getTokenExpirationTime(token) {
  if (!token) return null
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return null
  return decoded.exp * 1000 // Convert to milliseconds
}

// Get token expiration info (remaining time, expiration date, etc.)
function getTokenExpirationInfo(token) {
  if (!token) return null
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return null
  
  const expirationTime = decoded.exp * 1000 // Convert to milliseconds
  const currentTime = Date.now()
  const remainingTime = expirationTime - currentTime
  
  return {
    decoded,
    expirationTime,
    expirationDate: new Date(expirationTime),
    remainingTime,
    remainingSeconds: Math.floor(remainingTime / 1000),
    remainingMinutes: Math.floor(remainingTime / 60000),
    remainingHours: Math.floor(remainingTime / 3600000),
    remainingDays: Math.floor(remainingTime / 86400000),
    isExpired: remainingTime <= 0,
    iat: decoded.iat ? new Date(decoded.iat * 1000) : null, // Issued at
    exp: decoded.exp ? new Date(decoded.exp * 1000) : null // Expiration
  }
}

// Get API base URL
const getApiBaseURL = () => {
  // Check for environment variable first (highest priority)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Check for localhost backend (for local development)
  if (import.meta.env.VITE_USE_LOCALHOST === 'true') {
    return import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000'
  }
  
  // In development, use proxy (if Vite dev server is running)
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // In production, use direct URL
  return 'https://api.zero2heros.ch'
}

// Enforce HTTPS in production
if (import.meta.env.PROD && typeof window !== 'undefined') {
  const apiBaseURL = getApiBaseURL()
  if (apiBaseURL && !apiBaseURL.startsWith('https://') && !apiBaseURL.startsWith('http://localhost')) {
    console.error('⚠️ API base URL must use HTTPS in production')
  }
}

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  // Retry configuration for rate limiting
  retry: 1,
  retryDelay: 1000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getToken()
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token expired, remove it and trigger logout
        localStorage.removeItem('authToken')
        if (typeof document !== 'undefined') {
          document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
        }
        // Trigger logout event (React Query cache will be cleared by AuthContext)
        // Dispatch custom event to trigger logout in AuthContext
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tokenExpired'))
        }
        return Promise.reject(new Error('Token expired'))
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Log connection errors with detailed information
    if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED') || error.code === 'ECONNREFUSED') {
      const baseURL = error.config?.baseURL || 'unknown'
      const fullURL = baseURL + (error.config?.url || '')
      
      console.error('❌ Network Error - Backend sunucusuna bağlanılamıyor!')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Base URL:', baseURL)
      console.error('Request URL:', fullURL)
      console.error('Method:', error.config?.method?.toUpperCase())
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('🔍 Çözüm önerileri:')
      console.error('1. Backend sunucusu çalışıyor mu? Kontrol edin.')
      console.error('2. Development modunda: Vite dev server çalışıyor mu? (npm run dev)')
      console.error('3. .env dosyası oluşturup VITE_API_BASE_URL belirleyebilirsiniz')
      console.error('4. Local backend kullanıyorsanız: VITE_USE_LOCALHOST=true ekleyin')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Show user-friendly error in browser console
      if (typeof window !== 'undefined') {
        console.error('%c⚠️ Backend Bağlantı Hatası', 'color: red; font-size: 16px; font-weight: bold')
        console.error(`Backend URL: ${baseURL}`)
        console.error('Backend sunucusuna erişilemiyor. Lütfen:')
        console.error('- Backend sunucusunun çalıştığından emin olun')
        console.error('- Network bağlantınızı kontrol edin')
        console.error('- Vite dev server çalışıyorsa proxy ayarlarını kontrol edin')
      }
    }
    
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('authToken')
          if (typeof document !== 'undefined') {
            document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
          }
          // Trigger logout event (React Query cache will be cleared by AuthContext)
          // Dispatch custom event to trigger logout in AuthContext
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tokenExpired'))
          }
          break
        case 403:
          // Forbidden
          console.error('Forbidden: You do not have permission')
          break
        case 404:
          // Not found
          console.error('Not found: The resource does not exist')
          break
        case 500: {
          // Internal server error
          const errorData = error.response?.data || {}
          const requestConfig = error.config || {}
          const requestMethod = requestConfig.method?.toUpperCase() || 'UNKNOWN'
          const requestURL = (requestConfig.baseURL || '') + (requestConfig.url || '')
          
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('❌ 500 Internal Server Error - Backend hatası!')
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('📋 Request Bilgileri:')
          console.error('   Method:', requestMethod)
          console.error('   URL:', requestURL)
          console.error('   Endpoint:', requestConfig.url)
          console.error('   Base URL:', requestConfig.baseURL)
          
          // Log request body if it was a POST/PUT/PATCH
          if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && requestConfig.data) {
            console.error('📤 Gönderilen Request Body:')
            try {
              const requestBody = typeof requestConfig.data === 'string' 
                ? requestConfig.data 
                : JSON.stringify(requestConfig.data, null, 2)
              console.error(requestBody)
            } catch (err) {
              console.error('⚠️ Request body loglanamadı:', requestConfig.data, err)
            }
          }
          
          // Log request headers
          if (requestConfig.headers) {
            const headersToLog = { ...requestConfig.headers }
            if (headersToLog.Authorization) {
              headersToLog.Authorization = headersToLog.Authorization.substring(0, 20) + '...'
            }
            console.error('📋 Request Headers:', headersToLog)
          }
          
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('📥 Backend Response:')
          console.error('   Status Code:', error.response.status)
          console.error('   Error Message:', errorData.message || errorData.error || 'Internal Server Error')
          console.error('   Error Data:', errorData)
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('💡 Bu bir backend hatası. Backend ekibine bildirin:')
          console.error(`   - Endpoint: ${requestConfig.url}`)
          console.error(`   - Method: ${requestMethod}`)
          console.error(`   - Status: 500`)
          console.error(`   - Message: ${errorData.message || errorData.error || 'Internal Server Error'}`)
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          break
        }
        default:
          console.error('An error occurred:', error.response.data)
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server:', error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
export { decodeToken, isTokenExpired, getTokenExpirationTime, getTokenExpirationInfo }




