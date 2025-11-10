import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService.js'
import { useI18n } from '../contexts/I18nContext.jsx'
import { decodeToken } from '../services/api.js'

export function LoginPage() {
  const { login, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
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

  const handleGoogleSignIn = () => {
    setError('')
    signInWithGoogle()
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await authService.login({ email, password })
      const token = res?.data?.accessToken || res?.data?.data?.accessToken
      if (!token) throw new Error('Token missing in login response')
      // Persist token first
      const maxAge = 60 * 60 * 24 * 7
      document.cookie = `authToken=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Strict; Secure`
      localStorage.setItem('authToken', token)

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

      // Then fetch profile with that token
      let displayName = email
      const [profileRes] = await Promise.all([
        authService.getProfile(token)
      ])
      const p = profileRes?.data?.data || profileRes?.data || {}
      displayName = p.username || [p.firstName, p.lastName].filter(Boolean).join(' ') || p.name || email
      
      // If role not found in token, try to get from profile
      if (!userRole) {
        userRole = p.role || p.roles?.[0] || null
      }

      console.log('User Role:', userRole, 'Token Roles:', decodedToken?.realm_access?.roles)
      login({ username: displayName, email, role: userRole })
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      setError(t('loginFailed'))
    }
  }

  const updateRegisterField = (field) => (e) => {
    setRegisterForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegisterError('')
    setRegisterSuccess('')
    setRegisterSubmitting(true)
    try {
      await authService.register(registerForm)
      setRegisterSuccess(t('registrationSuccessful'))
    } catch (err) {
      console.error('Register error:', err)
      const msg = err?.response?.data?.message || t('registrationFailed')
      setRegisterError(msg)
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
              onChange={(e) => setEmail(e.target.value)}
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

            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 500
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('signInWithGoogle')}
            </button>
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