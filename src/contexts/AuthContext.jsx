import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcıyı kontrol et
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    // Remove auth token cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
    }
    localStorage.removeItem('authToken')
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
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}