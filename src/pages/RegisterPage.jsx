import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authService } from '../services/authService.js'
import { sanitizeInput, sanitizeObject, clearSensitiveData, rateLimiter } from '../utils/security.js'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Cleanup sensitive data on unmount
  useEffect(() => {
    return () => {
      const clearedForm = { ...form }
      clearSensitiveData(clearedForm)
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
      })
    }
  }, [])

  function updateField(field) {
    return (e) => {
      const sanitizedValue = sanitizeInput(e.target.value)
      setForm((prev) => ({ ...prev, [field]: sanitizedValue }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    e.stopPropagation()
    
    if (submitting) return
    
    // Rate limiting check
    const rateLimitKey = `register-${form.email}`
    if (!rateLimiter.canMakeRequest(rateLimitKey)) {
      setError('Too many registration attempts. Please wait a moment.')
      toast.error('Too many registration attempts. Please wait a moment.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }
    
    setError('')
    setSubmitting(true)
    
    try {
      // Sanitize all form inputs
      const sanitizedForm = sanitizeObject(form)
      
      await authService.register(sanitizedForm)
      
      // Clear sensitive data
      const clearedForm = { ...sanitizedForm }
      clearSensitiveData(clearedForm)
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
      })
      
      toast.success('Registration successful. You can now sign in.', {
        position: 'top-right',
        autoClose: 3000,
      })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      console.error('Register error:', err)
      const msg = err?.response?.data?.message || 'Registration failed'
      setError(sanitizeInput(msg))
      toast.error(sanitizeInput(msg), {
        position: 'top-right',
        autoClose: 5000,
      })
      
      // Reset rate limiter on error
      rateLimiter.reset(rateLimitKey)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container section">
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem', border: '1px solid #e5e5e5', borderRadius: '0.5rem', background: '#fff' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '2rem' }}>Register</h1>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c33', borderRadius: '0.375rem', fontSize: '0.9rem' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>First Name</label>
              <input type="text" value={form.firstName} onChange={updateField('firstName')} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '0.375rem', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Last Name</label>
              <input type="text" value={form.lastName} onChange={updateField('lastName')} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '0.375rem', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
              <input type="email" value={form.email} onChange={updateField('email')} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '0.375rem', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Phone</label>
              <input type="text" value={form.phone} onChange={updateField('phone')} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '0.375rem', fontSize: '1rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={updateField('password')}
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
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#9B724C', textDecoration: 'underline' }}>Login</Link>
        </div>
      </div>
    </div>
  )
}



