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
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken')
          // window.location.href = '/login'
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




