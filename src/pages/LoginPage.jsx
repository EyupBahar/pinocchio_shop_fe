import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService.js'
import { useI18n } from '../contexts/I18nContext.jsx'
import { decodeToken } from '../services/api.js'
import { sanitizeInput, sanitizeObject, clearSensitiveData, rateLimiter, debounce } from '../utils/security.js'

export function LoginPage() {
  const { loginMutation, refetchUser, login } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [error, setError] = useState('')
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [registerSubmitting, setRegisterSubmitting] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const formRef = useRef(null)

  // Cleanup sensitive data on unmount
  useEffect(() => {
    return () => {
      // Clear sensitive form data
      setPassword('')
      setRegisterForm(prev => {
        const cleared = { ...prev }
        cleared.password = ''
        clearSensitiveData(cleared)
        return cleared
      })
    }
  }, [])

  // Google OAuth login handler - Backend-managed OAuth flow via Keycloak Identity Broker
  // Flow: Frontend → Backend (/auth/google/login) → Keycloak (with kc_idp_hint=google) → Google → Keycloak → Backend (/auth/google/callback) → Keycloak Token
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      setError('')
      
      // Clear ALL previous tokens and auth data to ensure fresh authentication
      // This ensures that new login will create a completely new token
      if (typeof window !== 'undefined') {
        // Clear localStorage tokens
        localStorage.removeItem('authToken')
        Object.keys(localStorage).forEach(key => {
          if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear cookies
        document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
        document.cookie = 'authToken=; Path=/; Max-Age=0'
        document.cookie = 'token=; Path=/; Max-Age=0'
        
        // Clear OAuth state
        sessionStorage.removeItem('oauth_state')
        sessionStorage.removeItem('google_oauth_state')
        sessionStorage.removeItem('keycloak_state')
        
        // Clear all sessionStorage auth data
        Object.keys(sessionStorage).forEach(key => {
          if (key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('auth') || 
              key.toLowerCase().includes('oauth')) {
            sessionStorage.removeItem(key)
          }
        })
      }
      
      // Step 1: Request Google OAuth URL from backend
      // Backend will generate Keycloak OAuth URL with kc_idp_hint=google
      // Backend should include redirect_uri and state parameters
      const redirectUri = `${window.location.origin}/login`
      
      try {
        // Try to get Keycloak URL from backend
        // Request with prompt=select_account to force account selection every time
        // This ensures Google always shows account selection screen, never auto-login
        const response = await authService.initiateGoogleLogin({
          redirectUri: redirectUri,
          prompt: 'select_account' // Force Google to ALWAYS show account selection screen
        })
        
        // Step 2: Backend returns Keycloak OAuth URL
        // Option A: Backend returns { redirectUrl: "https://keycloak.../auth?..." }
        // Option B: Backend directly redirects (302 redirect)
        let redirectUrl = response?.data?.redirectUrl || response?.data?.url || response?.data?.authUrl
        
        if (redirectUrl) {
          // CRITICAL: Ensure prompt=select_account is in the URL to prevent auto-login
          // This forces Google to show account selection screen every time
          // Remove any existing prompt parameter and add select_account
          if (redirectUrl.includes('prompt=')) {
            // Replace existing prompt with select_account
            redirectUrl = redirectUrl.replace(/[&?]prompt=[^&]*/g, '')
          }
          // Add prompt=select_account to force account selection
          redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + 'prompt=select_account'
          
          // Redirect user to Keycloak (which will redirect to Google)
          window.location.href = redirectUrl
          return // Don't set loading to false, we're redirecting
        }
      } catch (apiError) {
        // If API call fails (network error, backend down, etc.), use fallback
        console.warn('Backend API call failed, using Keycloak fallback:', apiError)
      }
      
      // Fallback: If backend doesn't return URL or API fails, construct Keycloak URL directly
      // This is a fallback - ideally backend should handle this
      const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'https://keycloak.zero2heros.ch'
      const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'pinocchio-realm'
      const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'pinocchio-client'
      
      // Generate state for CSRF protection
      const state = `${Date.now()}-${Math.random().toString(36).substring(7)}`
      sessionStorage.setItem('oauth_state', state)
      
      // Build Keycloak OAuth URL with prompt=select_account to force account selection
      // This ensures Google ALWAYS shows account selection screen, never auto-login
      const keycloakAuthUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/auth?` +
        `client_id=${encodeURIComponent(keycloakClientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid profile email&` +
        `state=${encodeURIComponent(state)}&` +
        `kc_idp_hint=google&` +
        `prompt=select_account`
      
      // Redirect user to Keycloak (which will redirect to Google)
      window.location.href = keycloakAuthUrl
    } catch (error) {
      console.error('Google login initiation error:', error)
      const errorMessage = error.response?.data?.message || error.message || t('googleLoginError') || 'Google login failed'
      setError(errorMessage)
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
      setIsGoogleLoading(false)
    }
  }

  // Handle Google OAuth callback - when user returns from Google
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')
    
    if (errorParam) {
      setError(t('googleLoginError') || 'Google login failed')
      toast.error(t('googleLoginError') || 'Google login failed', {
        position: 'top-right',
        autoClose: 5000,
      })
      // Clean URL
      navigate('/login', { replace: true })
      return
    }
    
    if (code) {
      // Step 3: Google redirected back with authorization code
      // Send code to backend for token exchange
      handleGoogleCallback(code, state)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleGoogleCallback = async (code, state) => {
    try {
      setIsGoogleLoading(true)
      setError('')
      
      // Clear any existing tokens before processing new login
      // This ensures we get a fresh token from backend
      localStorage.removeItem('authToken')
      document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
      
      // Validate state (CSRF protection)
      const savedState = sessionStorage.getItem('oauth_state')
      if (state && savedState && state !== savedState) {
        throw new Error('Invalid state parameter - possible CSRF attack')
      }
      if (state) {
        sessionStorage.removeItem('oauth_state')
      }
      
      // Step 4: Send authorization code to backend for NEW token generation
      // Backend will:
      //   - Exchange code with Keycloak for access token (if Keycloak Identity Broker)
      //   - OR Exchange code with Google for access token, then with Keycloak
      //   - Return NEW Keycloak access token and refresh token
      const redirectUri = `${window.location.origin}/login`
      
      // Try different payload formats that backend might expect
      let response
      try {
        // Format 1: { code, state, redirectUri }
        response = await authService.handleGoogleCallback({ 
          code, 
          state, 
          redirectUri 
        })
      } catch (error) {
        // If 401, try Format 2: { code, redirectUri } (without state)
        if (error.response?.status === 401) {
          console.warn('First attempt failed, trying without state parameter')
          try {
            response = await authService.handleGoogleCallback({ 
              code, 
              redirectUri 
            })
          } catch (error2) {
            // If still 401, try Format 3: { code } (minimal)
            if (error2.response?.status === 401) {
              console.warn('Second attempt failed, trying with code only')
              response = await authService.handleGoogleCallback({ code })
            } else {
              throw error2
            }
          }
        } else {
          throw error
        }
      }
      
      // Step 5: Extract Keycloak token from response
      const authToken = response?.data?.accessToken || 
                       response?.data?.data?.accessToken || 
                       response?.data?.token || 
                       response?.data?.data?.token || 
                       response?.data?.access_token ||
                       response?.data?.data?.access_token
      
      if (!authToken) {
        // Log full response for debugging
        console.error('No token in response:', response?.data)
        throw new Error('No token received from Google login')
      }
      
      // Step 6: Decode Keycloak token to get user info
      const decodedToken = decodeToken(authToken)
      if (!decodedToken) {
        throw new Error('Invalid token received from backend')
      }
      
      const userData = {
        userId: decodedToken?.sub || null,
        email: decodedToken?.email || '',
        username: decodedToken?.name || decodedToken?.preferred_username || '',
        role: decodedToken?.realm_access?.roles?.[0] || null,
      }
      
      // Step 7: Login user with Keycloak token
      login(userData)
      
      // Store token manually (login function should handle this, but just in case)
      localStorage.setItem('authToken', authToken)
      
      // Refetch user to ensure we have the latest data
      await refetchUser()
      
      // Show welcome toast
      const displayName = userData?.username || userData?.email || 'User'
      const welcomeMessage = t('welcomeUsername')?.replace('{username}', sanitizeInput(displayName)) || `Welcome, ${displayName}!`
      toast.success(welcomeMessage, {
        position: 'top-right',
        autoClose: 3000,
      })
      
      // Clean URL and navigate
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Google callback error:', error)
      
      // Extract detailed error message
      let errorMessage = t('googleLoginError') || 'Google login failed'
      
      if (error.response) {
        // Backend returned an error response
        const errorData = error.response.data
        errorMessage = errorData?.message || 
                      errorData?.error || 
                      errorData?.error_description ||
                      `Backend error: ${error.response.status} ${error.response.statusText}`
        
        // Log detailed error for debugging
        console.error('Backend error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: errorData
        })
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
      navigate('/login', { replace: true })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Rate-limited and debounced login handler
  const handleSubmitInternal = useCallback(async (emailValue, passwordValue) => {
    if (isSubmitting) return
    
    // Rate limiting check
    const rateLimitKey = `login-${emailValue}`
    if (!rateLimiter.canMakeRequest(rateLimitKey)) {
      setError('Too many login attempts. Please wait a moment.')
      toast.error('Too many login attempts. Please wait a moment.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    setIsSubmitting(true)
    setError('')
    
    // Clear any existing tokens before login to ensure new token is created
    localStorage.removeItem('authToken')
    document.cookie = 'authToken=; Path=/; Max-Age=0; SameSite=Strict; Secure'
    
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(emailValue)
      const sanitizedPassword = sanitizeInput(passwordValue)
      
      const userData = await loginMutation.mutateAsync({ 
        email: sanitizedEmail, 
        password: sanitizedPassword 
      })
      
      // Clear sensitive data from memory
      clearSensitiveData({ password: sanitizedPassword })
      
      // Refetch user to ensure we have the latest data
      await refetchUser()
      
      // Show welcome toast
      const displayName = userData?.username || sanitizedEmail
      const welcomeMessage = t('welcomeUsername').replace('{username}', sanitizeInput(displayName))
      toast.success(welcomeMessage, {
        position: 'top-right',
        autoClose: 3000,
      })
      
      // Clear form data
      setEmail('')
      setPassword('')
      
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      const errorMsg = err?.response?.data?.message || t('loginFailed')
      setError(sanitizeInput(errorMsg))
      
      // Reset rate limiter on error
      rateLimiter.reset(rateLimitKey)
    } finally {
      setIsSubmitting(false)
    }
  }, [loginMutation, refetchUser, navigate, t, isSubmitting])

  // Debounced submit handler
  const debouncedSubmit = useCallback(
    debounce((emailValue, passwordValue) => {
      handleSubmitInternal(emailValue, passwordValue)
    }, 500),
    [handleSubmitInternal]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isSubmitting) return
    
    // Sanitize inputs before processing
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)
    
    if (!sanitizedEmail || !sanitizedPassword) {
      setError('Please fill in all fields')
      return
    }
    
    await handleSubmitInternal(sanitizedEmail, sanitizedPassword)
  }

  const updateRegisterField = (field) => (e) => {
    const sanitizedValue = sanitizeInput(e.target.value)
    setRegisterForm((prev) => ({ ...prev, [field]: sanitizedValue }))
  }

  // Rate-limited register handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (registerSubmitting) return
    
    // Rate limiting check
    const rateLimitKey = `register-${registerForm.email}`
    if (!rateLimiter.canMakeRequest(rateLimitKey)) {
      setRegisterError('Too many registration attempts. Please wait a moment.')
      toast.error('Too many registration attempts. Please wait a moment.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }
    
    setRegisterError('')
    setRegisterSuccess('')
    setRegisterSubmitting(true)
    
    try {
      // Sanitize all form inputs
      const sanitizedForm = sanitizeObject(registerForm)
      
      await authService.register(sanitizedForm)
      
      // Clear sensitive data
      const clearedForm = { ...sanitizedForm }
      clearSensitiveData(clearedForm)
      setRegisterForm({ firstName: '', lastName: '', email: '', phone: '', password: '' })
      
      setRegisterSuccess(t('registrationSuccessful'))
    } catch (err) {
      console.error('Register error:', err)
      const msg = err?.response?.data?.message || t('registrationFailed')
      setRegisterError(sanitizeInput(msg))
      
      // Reset rate limiter on error
      rateLimiter.reset(rateLimitKey)
    } finally {
      setRegisterSubmitting(false)
    }
  }

  return (
    <div className="container section">
      <div style={{ 
        maxWidth: '400px', 
        margin: '0 auto', 
        padding: '2rem',
        border: '1px solid #e5e5e5',
        borderRadius: '0.5rem',
        background: '#fff'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          {t('myAccount')}
        </h1>
        
        {/* Toggle Button for Login/Register */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            borderRadius: '25px',
            border: '1px solid #4A4A4A',
            overflow: 'hidden',
            background: 'white',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}>
            <button
              onClick={() => setIsLoginMode(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                border: 'none',
                background: isLoginMode ? '#D4B88C' : 'white',
                color: isLoginMode ? 'white' : '#4A4A4A',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: isLoginMode ? '25px 0 0 25px' : '0',
                minWidth: '120px',
                justifyContent: 'center'
              }}
            >
              {t('login')}
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                border: 'none',
                background: !isLoginMode ? '#D4B88C' : 'white',
                color: !isLoginMode ? 'white' : '#4A4A4A',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: !isLoginMode ? '0 25px 25px 0' : '0',
                minWidth: '120px',
                justifyContent: 'center'
              }}
            >
              {t('register')}
            </button>
          </div>
        </div>
        
        {isLoginMode && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {t('email')}
              </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(sanitizeInput(e.target.value))}
              placeholder="user@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              required
            />
          </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {t('password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.5rem',
                    border: '1px solid #e5e5e5',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              background: '#fee',
              color: '#c33',
              borderRadius: '0.375rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {t('login')}
            </button>
          </form>
        )}

        {isLoginMode && (
          <div style={{ 
            marginTop: '1.5rem', 
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              marginBottom: '1rem',
              color: '#666',
              fontSize: '0.875rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }}></div>
              <span>{t('or')}</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: '#fff',
                  cursor: isGoogleLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  opacity: isGoogleLoading ? 0.6 : 1
                }}
                onMouseOver={(e) => {
                  if (!isGoogleLoading) {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isGoogleLoading) {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }
                }}
              >
                {isGoogleLoading ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>{t('loading') || 'Loading...'}</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>{t('signInWithGoogle') || 'Sign in with Google'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!isLoginMode && (
          <div style={{ marginTop: '2rem' }}>
            {registerError && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '0.375rem', fontSize: '0.9rem' }}>{registerError}</div>
            )}
            {registerSuccess && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#e7f9ed', color: '#0f7b3f', borderRadius: '0.375rem', fontSize: '0.9rem' }}>{registerSuccess}</div>
            )}
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('firstName')}</label>
                  <input type="text" value={registerForm.firstName} onChange={updateRegisterField('firstName')} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '0.375rem', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('lastName')}</label>
                  <input type="text" value={registerForm.lastName} onChange={updateRegisterField('lastName')} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '0.375rem', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('email')}</label>
                  <input type="email" value={registerForm.email} onChange={updateRegisterField('email')} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '0.375rem', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('phone')}</label>
                  <input type="tel" value={registerForm.phone} onChange={updateRegisterField('phone')} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '0.375rem', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={updateRegisterField('password')}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        paddingRight: '2.5rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '0.375rem',
                        fontSize: '1rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280'
                      }}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} disabled={registerSubmitting}>
                {registerSubmitting ? t('submitting') : t('createAccount')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}