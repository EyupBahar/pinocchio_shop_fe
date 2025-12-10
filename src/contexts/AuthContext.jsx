import { createContext, useContext, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isTokenExpired, getTokenExpirationTime, decodeToken } from '../services/api.js'
import { authService } from '../services/authService.js'

const AuthContext = createContext(undefined)

// Query keys
export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  token: () => [...authKeys.all, 'token'],
}

// Get token from storage
const getToken = () => {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  for (const c of cookies) {
    const [k, v] = c.split('=')
    if (k === 'authToken') return decodeURIComponent(v)
  }
  return localStorage.getItem('authToken')
}

// Set token in storage
const setToken = (token) => {
  if (!token) return
  localStorage.setItem('authToken', token)
  // Also set in cookie
  if (typeof document !== 'undefined') {
    const expirationDate = new Date()
    expirationDate.setTime(expirationDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    document.cookie = `authToken=${encodeURIComponent(token)}; Path=/; Expires=${expirationDate.toUTCString()}; SameSite=Strict; Secure`
  }
}

// Remove token from storage
const removeToken = () => {
  localStorage.removeItem('authToken')
  if (typeof document !== 'undefined') {
    document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
  }
}

// Load user from token
const loadUserFromToken = async (token, providedUserId = null) => {
  if (!token || isTokenExpired(token)) {
    return null
  }

  const decodedToken = decodeToken(token)
  if (!decodedToken) {
    return null
  }

  // Get role from token
  let userRole = null
  if (decodedToken?.realm_access?.roles) {
    if (decodedToken.realm_access.roles.includes('Admin')) {
      userRole = 'Admin'
    } else if (decodedToken.realm_access.roles.includes('admin')) {
      userRole = 'admin'
    } else {
      userRole = decodedToken.realm_access.roles[0] || null
    }
  }

  // Try to get user from localStorage first
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser)
      if (userRole) {
        userData.role = userRole
      }
      if (providedUserId) {
        userData.userId = providedUserId
      }
      return userData
    } catch (e) {
      console.error('Error parsing saved user:', e)
    }
  }

  // Try to get user from API
  try {
    const profileRes = await authService.getProfile(token)
    const profile = profileRes?.data?.data || profileRes?.data || {}
    
    // Get userId - use providedUserId first, then try token, then profile
    let userId = providedUserId
    if (!userId) {
      userId = decodedToken?.sub || decodedToken?.userId || decodedToken?.user_id || decodedToken?.id || decodedToken?.nameid || null
      if (userId) {
        userId = typeof userId === 'number' 
          ? userId 
          : (typeof userId === 'string' && !isNaN(parseInt(userId)) && !userId.includes('-'))
            ? parseInt(userId, 10) 
            : userId
      }
    }
    
    if (!userId) {
      userId = profile.id || profile.userId || profile.user_id || profile.sub || null
      if (userId) {
        userId = typeof userId === 'number' 
          ? userId 
          : (typeof userId === 'string' && !isNaN(parseInt(userId)) && !userId.includes('-'))
            ? parseInt(userId, 10) 
            : userId
      }
    }
    
    // Get role from profile if not in token
    if (!userRole) {
      userRole = profile.role || profile.roles?.[0] || null
    }
    
    const displayName = profile.username || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || profile.email || decodedToken?.email || decodedToken?.preferred_username || 'User'
    const email = profile.email || decodedToken?.email || ''
    
    const userData = { 
      username: displayName, 
      email: email,
      role: userRole,
      userId: userId
    }
    
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  } catch (err) {
    console.error('❌ Profile API hatası:', err)
    // Fallback to token data
    const email = decodedToken?.email || decodedToken?.preferred_username || ''
    const username = decodedToken?.name || decodedToken?.preferred_username || email || 'User'
    
    let userId = decodedToken?.sub || decodedToken?.userId || decodedToken?.user_id || decodedToken?.id || decodedToken?.nameid || null
    if (userId) {
      userId = typeof userId === 'number' 
        ? userId 
        : (typeof userId === 'string' && !isNaN(parseInt(userId)) && !userId.includes('-'))
          ? parseInt(userId, 10) 
          : userId
    }
    
    const userData = { 
      username: username, 
      email: email,
      role: userRole,
      userId: userId
    }
    
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const tokenCheckIntervalRef = useRef(null)

  // Removed window.__REACT_QUERY_CLIENT__ exposure for security
  // API interceptor now gets token directly from storage

  // Query for user data
  const { data: user, isLoading, refetch: refetchUser } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const token = getToken()
      if (!token) {
        return null
      }
      return await loadUserFromToken(token)
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  // Query for token
  const { data: token } = useQuery({
    queryKey: authKeys.token(),
    queryFn: () => getToken(),
    enabled: true,
    staleTime: Infinity,
  })

  // Check token expiration and logout if expired
  const checkTokenExpiration = useCallback(() => {
    const currentToken = getToken()
    if (currentToken && isTokenExpired(currentToken)) {
      // Use queryClient to clear cache and remove token
      removeToken()
      queryClient.setQueryData(authKeys.token(), null)
      queryClient.setQueryData(authKeys.user(), null)
      queryClient.clear()
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
        tokenCheckIntervalRef.current = null
      }
    }
  }, [queryClient])

  // Set up periodic token check
  const setupTokenCheck = useCallback(() => {
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current)
    }

    const currentToken = getToken()
    if (currentToken) {
      const expirationTime = getTokenExpirationTime(currentToken)
      if (expirationTime) {
        // Check every minute
        tokenCheckIntervalRef.current = setInterval(() => {
          checkTokenExpiration()
        }, 60000) // Check every 60 seconds

        // Also set a timeout to logout exactly when token expires
        const timeUntilExpiration = expirationTime - Date.now()
        if (timeUntilExpiration > 0) {
          setTimeout(() => {
            checkTokenExpiration()
          }, timeUntilExpiration)
        }
      }
    }
  }, [checkTokenExpiration])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await authService.login({ email, password })
      console.log('🔍 Login API Response:', response?.data)
      
      // Try different possible token locations in response
      const token = response?.data?.accessToken || 
                   response?.data?.data?.accessToken || 
                   response?.data?.token || 
                   response?.data?.data?.token || 
                   response?.data?.access_token ||
                   response?.data?.data?.access_token
      
      if (!token) {
        throw new Error('No token received from login')
      }
      
      setToken(token)
      queryClient.setQueryData(authKeys.token(), token)
      
      // Get customerId from login response (highest priority)
      let userId = response?.data?.customerId || 
                   response?.data?.data?.customerId || 
                   response?.data?.customer_id || 
                   response?.data?.data?.customer_id || 
                   null
      
      // Load user data
      const userData = await loadUserFromToken(token, userId)
      queryClient.setQueryData(authKeys.user(), userData)
      
      return userData
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(authKeys.user(), userData)
      setupTokenCheck()
    },
    onError: (error) => {
      console.error('Login error:', error)
      removeToken()
      queryClient.setQueryData(authKeys.token(), null)
      queryClient.setQueryData(authKeys.user(), null)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      removeToken()
      localStorage.removeItem('user')
      queryClient.setQueryData(authKeys.token(), null)
      queryClient.setQueryData(authKeys.user(), null)
      queryClient.clear()
    },
    onSuccess: () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
        tokenCheckIntervalRef.current = null
      }
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async () => {
      const currentToken = getToken()
      if (!currentToken || isTokenExpired(currentToken)) {
        throw new Error('Token expired or not found')
      }
      return await loadUserFromToken(currentToken)
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(authKeys.user(), userData)
      localStorage.setItem('user', JSON.stringify(userData))
    },
    onError: (error) => {
      console.error('Update user error:', error)
    },
  })

  // Set up token check when token changes
  useEffect(() => {
    if (token) {
      setupTokenCheck()
    } else {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
        tokenCheckIntervalRef.current = null
      }
    }

    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
      }
    }
  }, [token, setupTokenCheck])

  // Listen for token expiration events from API interceptor
  useEffect(() => {
    const handleTokenExpired = () => {
      logoutMutation.mutate()
    }
    window.addEventListener('tokenExpired', handleTokenExpired)

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired)
    }
  }, [logoutMutation])

  // Login function
  const login = (userData) => {
    queryClient.setQueryData(authKeys.user(), userData)
    localStorage.setItem('user', JSON.stringify(userData))
    setupTokenCheck()
  }

  // Logout function
  const logout = () => {
    logoutMutation.mutate()
  }

  // Update user function
  const updateUser = async () => {
    updateUserMutation.mutate()
  }

  // Sign in with Google (placeholder)
  const signInWithGoogle = () => {
    const googleUser = { username: 'Google User', email: 'user@gmail.com' }
    login(googleUser)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      signInWithGoogle,
      updateUser,
      loginMutation,
      logoutMutation,
      updateUserMutation,
      refetchUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within AuthProvider. ' +
      'Make sure AuthProvider wraps your component tree in main.jsx'
    )
  }
  return context
}
