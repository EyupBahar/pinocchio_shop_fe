import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { isTokenExpired, getTokenExpirationTime, decodeToken } from '../services/api.js'
import { authService } from '../services/authService.js'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const tokenCheckIntervalRef = useRef(null)

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

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    // Remove auth token cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
    }
    localStorage.removeItem('authToken')
    // Clear token check interval
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current)
      tokenCheckIntervalRef.current = null
    }
  }

  // Check token expiration and logout if expired
  const checkTokenExpiration = () => {
    const token = getToken()
    if (token && isTokenExpired(token)) {
      logout()
    }
  }

  // Set up periodic token check
  const setupTokenCheck = () => {
    // Clear existing interval
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current)
    }

    const token = getToken()
    if (token) {
      const expirationTime = getTokenExpirationTime(token)
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
  }

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcıyı kontrol et
    const savedUser = localStorage.getItem('user')
    const token = getToken()

    const loadUserFromToken = async () => {
      // Check if token exists and is valid
      if (token && !isTokenExpired(token)) {
        // Decode token to get role information
        const decodedToken = decodeToken(token)
        let userRole = null
        
        // Check token for role information (Keycloak format)
        if (decodedToken?.realm_access?.roles) {
          // Check if Admin role exists in realm_access.roles
          if (decodedToken.realm_access.roles.includes('Admin')) {
            userRole = 'Admin'
          } else if (decodedToken.realm_access.roles.includes('admin')) {
            userRole = 'admin'
          } else {
            // Use first role if Admin not found
            userRole = decodedToken.realm_access.roles[0] || null
          }
        }

        if (savedUser) {
          const userData = JSON.parse(savedUser)
          // Update role from token if available
          if (userRole) {
            userData.role = userRole
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } else {
            setUser(userData)
          }
        } else {
          // Token var ama localStorage'da user yok - token'dan veya API'den user bilgisini al
          console.log('🔍 Token var ama localStorage\'da user yok, API\'den alınıyor...')
          
          // Try to get userId from token first
          let userId = decodedToken?.sub || decodedToken?.userId || decodedToken?.user_id || decodedToken?.id || decodedToken?.nameid || null
          if (userId) {
            userId = typeof userId === 'number' 
              ? userId 
              : (typeof userId === 'string' && !isNaN(parseInt(userId)) && !userId.includes('-'))
                ? parseInt(userId, 10) 
                : userId
          }
          
          try {
            const profileRes = await authService.getProfile(token)
            const profile = profileRes?.data?.data || profileRes?.data || {}
            const displayName = profile.username || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || profile.email || decodedToken?.email || decodedToken?.preferred_username || 'User'
            const email = profile.email || decodedToken?.email || ''
            
            // If userId not found in token, try to get from profile
            if (!userId) {
              const idFromProfile = profile.id || profile.userId || profile.user_id || profile.sub || null
              if (idFromProfile) {
                userId = typeof idFromProfile === 'number' 
                  ? idFromProfile 
                  : (typeof idFromProfile === 'string' && !isNaN(parseInt(idFromProfile)) && !idFromProfile.includes('-'))
                    ? parseInt(idFromProfile, 10) 
                    : idFromProfile
              }
            }
            
            // If role not found in token, try to get from profile
            if (!userRole) {
              userRole = profile.role || profile.roles?.[0] || null
            }
            
            const userData = { 
              username: displayName, 
              email: email,
              role: userRole,
              userId: userId
            }
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('✅ User bilgisi API\'den alındı:', userData)
          } catch (err) {
            console.error('❌ Profile API hatası:', err)
            // Token'dan minimal user bilgisi oluştur
            const email = decodedToken?.email || decodedToken?.preferred_username || ''
            const username = decodedToken?.name || decodedToken?.preferred_username || email || 'User'
            
            // If userId not found yet, try from token
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
            
            const userData = { 
              username: username, 
              email: email,
              role: userRole,
              userId: userId
            }
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('✅ User bilgisi token\'dan oluşturuldu:', userData)
          }
        }
        // Set up periodic token check
        setupTokenCheck()
      } else if (token && isTokenExpired(token)) {
        // Token expired, clear everything
        logout()
      } else {
        setIsLoading(false)
      }
    }

    loadUserFromToken().finally(() => {
      setIsLoading(false)
    })

    // Listen for token expiration events from API interceptor
    const handleTokenExpired = () => {
      logout()
    }
    window.addEventListener('tokenExpired', handleTokenExpired)

    // Cleanup
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired)
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current)
      }
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    // Set up token expiration check after login
    setupTokenCheck()
  }

  const signInWithGoogle = () => {
    // Google sign-in simülasyonu
    const googleUser = { username: 'Google User', email: 'user@gmail.com' }
    login(googleUser)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      signInWithGoogle 
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