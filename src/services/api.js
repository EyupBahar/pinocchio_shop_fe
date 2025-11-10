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

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://api.zero2heros.ch'),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getTokenFromCookie('authToken') || localStorage.getItem('authToken')
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token expired, remove it and trigger logout
        localStorage.removeItem('authToken')
        if (typeof document !== 'undefined') {
          document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
        }
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
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
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
        case 500:
          // Internal server error
          console.error('Server error: Something went wrong on the server')
          break
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




