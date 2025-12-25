import { createContext, useContext, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isTokenExpired, getTokenExpirationTime, decodeToken } from '../services/api.js'
import { authService } from '../services/authService.js'
import { credentialsProvider, googleProvider, jwtCallback, sessionCallback } from '../config/authConfig.js'

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

// Remove token from storage - comprehensive cleanup
const removeToken = () => {
  // Remove from localStorage
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  
  // Remove from all possible localStorage keys related to auth
  if (typeof window !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('user') ||
          key.toLowerCase().includes('session')) {
        localStorage.removeItem(key)
      }
    })
  }
  
  // Remove from cookies - try all possible cookie names and paths
  if (typeof document !== 'undefined') {
    // Remove authToken cookie with different paths
    document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
    document.cookie = 'authToken=; Path=/; Max-Age=0'
    document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Strict; Secure'
    document.cookie = 'token=; Path=/; Max-Age=0'
    document.cookie = 'accessToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
    document.cookie = 'accessToken=; Path=/; Max-Age=0'
    
    // Remove all cookies that might contain tokens
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      if (name.toLowerCase().includes('token') || 
          name.toLowerCase().includes('auth') ||
          name.toLowerCase().includes('session')) {
        document.cookie = `${name}=; Path=/; Max-Age=0`
        document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict; Secure`
        document.cookie = `${name}=; Path=/; Domain=${window.location.hostname}; Max-Age=0`
      }
    })
    
    // Clear OAuth state from sessionStorage
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('google_oauth_state')
    sessionStorage.removeItem('keycloak_state')
    
    // Clear all auth-related sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('oauth') ||
          key.toLowerCase().includes('session') ||
          key.toLowerCase().includes('user')) {
        sessionStorage.removeItem(key)
      }
    })
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

  // Login mutation - NextAuth.js'deki CredentialsProvider gibi
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      // Use credentialsProvider.authorize (NextAuth.js'deki gibi)
      const user = await credentialsProvider.authorize({ email, password })
      
      if (!user) {
        throw new Error('Invalid credentials')
      }

      // JWT Callback (NextAuth.js'deki gibi)
      const token = jwtCallback(
        {},
        user,
        { provider: 'credentials' }
      )

      // Store token
      setToken(token.accessToken)
      queryClient.setQueryData(authKeys.token(), token.accessToken)

      // Session Callback (NextAuth.js'deki gibi)
      const session = sessionCallback({}, token)

      // Store user data
      const userData = {
        userId: user.id,
        email: user.email,
        username: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isUserNew: user.isUserNew,
        provider: user.provider
      }

      queryClient.setQueryData(authKeys.user(), userData)
      localStorage.setItem('user', JSON.stringify(userData))

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

  // Logout mutation - Complete cleanup of all tokens and auth data
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Stop token expiration checks
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
        tokenCheckIntervalRef.current = null
      }
      
      // Remove all authentication tokens (comprehensive cleanup)
      removeToken()
      
      // Clear React Query cache - remove all auth-related data
      queryClient.setQueryData(authKeys.token(), null)
      queryClient.setQueryData(authKeys.user(), null)
      
      // Clear all queries related to auth
      queryClient.removeQueries({ queryKey: authKeys.all })
      
      // Clear entire cache to ensure no token data remains
      queryClient.clear()
      
      // Force refetch to ensure fresh state
      queryClient.invalidateQueries()
      
      // Additional cleanup for any remaining data
      if (typeof window !== 'undefined') {
        // Clear IndexedDB if used (future-proof)
        if ('indexedDB' in window) {
          try {
            indexedDB.databases().then(databases => {
              databases.forEach(db => {
                if (db.name && (db.name.includes('auth') || db.name.includes('token'))) {
                  indexedDB.deleteDatabase(db.name)
                }
              })
            })
          } catch (e) {
            // IndexedDB not available or error
          }
        }
      }
    },
    onSuccess: () => {
      // Ensure token check is stopped
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
        tokenCheckIntervalRef.current = null
      }
    },
  })

  // Google OAuth login mutation - NextAuth.js'deki GoogleProvider gibi
  const googleLoginMutation = useMutation({
    mutationFn: async ({ idToken, accessToken }) => {
      // Use googleProvider.authorize (NextAuth.js'deki gibi)
      const googleResponse = { credential: idToken, access_token: accessToken }
      const user = await googleProvider.authorize(googleResponse)
      
      if (!user) {
        throw new Error('Google authentication failed')
      }

      // JWT Callback (NextAuth.js'deki gibi)
      const token = jwtCallback(
        {},
        user,
        { provider: 'google' }
      )

      // Store token
      setToken(token.accessToken)
      queryClient.setQueryData(authKeys.token(), token.accessToken)

      // Session Callback (NextAuth.js'deki gibi)
      const session = sessionCallback({}, token)

      // Store user data
      const userData = {
        userId: user.id,
        email: user.email,
        username: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isUserNew: user.isUserNew,
        provider: user.provider
      }

      queryClient.setQueryData(authKeys.user(), userData)
      localStorage.setItem('user', JSON.stringify(userData))

      return userData
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(authKeys.user(), userData)
      setupTokenCheck()
    },
    onError: (error) => {
      console.error('Google login error:', error)
      removeToken()
      queryClient.setQueryData(authKeys.token(), null)
      queryClient.setQueryData(authKeys.user(), null)
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

  // Sign in function - NextAuth.js'deki signIn gibi
  const signIn = async (provider, credentials) => {
    if (provider === 'credentials') {
      return await loginMutation.mutateAsync(credentials)
    } else if (provider === 'google') {
      return await signInWithGoogle(credentials)
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  // Sign in with Google - NextAuth.js'deki gibi
  const signInWithGoogle = async (googleResponse) => {
    if (!googleResponse || !googleResponse.credential) {
      throw new Error('Invalid Google OAuth response')
    }
    
    // GoogleLogin component returns credential (idToken) in the response
    const idToken = googleResponse.credential
    // For GoogleLogin, we don't get access_token directly, only idToken
    // Backend will verify idToken and exchange with Keycloak token
    const accessToken = null
    
    // Call Google login mutation
    return await googleLoginMutation.mutateAsync({ idToken, accessToken })
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      signIn, // NextAuth.js'deki signIn gibi
      signInWithGoogle,
      updateUser,
      loginMutation,
      googleLoginMutation,
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

