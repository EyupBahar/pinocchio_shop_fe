import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { userService } from '../services/userService.js'

export function UpdateUserPage() {
  const { id } = useParams()
  const { user: currentUser, updateUser: refreshUser } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userFields, setUserFields] = useState([])

  const [userData, setUserData] = useState({})

  // Load user data using getProfile API
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Always use getProfile to get current user's data
        const response = await userService.getProfile()
        const user = response?.data?.data || response?.data || {}
        
        // Use id from params if provided (for update), otherwise use from profile
        const updateId = id || user.id || user.userId || currentUser?.userId || null
        setUserId(updateId)
        
        console.log('Loaded user data:', user)
        
        // Dynamically create fields based on received data
        const fields = {}
        const addressFields = {}
        
        // Map all user properties to form fields
        Object.keys(user).forEach(key => {
          // Skip internal fields
          if (key === 'id' || key === 'userId' || key === 'password' || key === 'role') {
            return
          }
          
          // Handle address object
          if (key === 'address' && typeof user[key] === 'object' && user[key] !== null) {
            Object.keys(user[key]).forEach(addrKey => {
              addressFields[addrKey] = user[key][addrKey] || ''
            })
          } else {
            fields[key] = user[key] || ''
          }
        })
        
        // Set default address structure if not present
        if (Object.keys(addressFields).length === 0) {
          addressFields.street = ''
          addressFields.city = ''
          addressFields.region = ''
          addressFields.postalCode = ''
          addressFields.country = ''
          addressFields.companyName = ''
        }
        
        // Set user data with all fields
        setUserData({
          ...fields,
          password: '', // Always empty for password field
          address: addressFields
        })
        
        // Create field list for dynamic rendering
        const fieldList = []
        
        // Standard fields
        if (user.firstName !== undefined) fieldList.push({ key: 'firstName', label: t('firstName'), required: true, type: 'text' })
        if (user.lastName !== undefined) fieldList.push({ key: 'lastName', label: t('lastName'), required: true, type: 'text' })
        if (user.email !== undefined) fieldList.push({ key: 'email', label: t('email'), required: true, type: 'email' })
        if (user.phone !== undefined) fieldList.push({ key: 'phone', label: t('phone'), required: false, type: 'text' })
        
        // Add other fields dynamically
        Object.keys(user).forEach(key => {
          if (!['id', 'userId', 'firstName', 'lastName', 'email', 'phone', 'password', 'role', 'address'].includes(key)) {
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()
            fieldList.push({ key, label, required: false, type: 'text' })
          }
        })
        
        setUserFields(fieldList)
        
      } catch (err) {
        console.error('User load error:', err)
        const errorMessage = err?.response?.data?.message || t('userLoadError')
        setError(errorMessage)
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [id, currentUser])

  const updateField = (field) => {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setUserData((prev) => ({ ...prev, [field]: value }))
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate required fields
    if ((userData.firstName !== undefined && !userData.firstName) || 
        (userData.lastName !== undefined && !userData.lastName) || 
        (userData.email !== undefined && !userData.email)) {
      setError(t('pleaseFillRequiredFields'))
      return
    }

    if (!userId) {
      setError(t('userIdNotFound'))
      return
    }

    try {
      setSaving(true)

      // Prepare update data - clean and format data for backend
      const updateData = {}
      
      // Add standard fields if they exist
      if (userData.firstName !== undefined) updateData.firstName = userData.firstName.trim()
      if (userData.lastName !== undefined) updateData.lastName = userData.lastName.trim()
      if (userData.email !== undefined) updateData.email = userData.email.trim()
      if (userData.phone !== undefined && userData.phone.trim() !== '') {
        updateData.phone = userData.phone.trim()
      }
      
      // Only include password if it's provided and not empty
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password.trim()
      }

      // Add any other fields that might exist (excluding internal fields)
      Object.keys(userData).forEach(key => {
        if (!['password', 'address', 'id', 'userId', 'role'].includes(key) && 
            userData[key] !== undefined && 
            userData[key] !== null && 
            userData[key] !== '') {
          // If it's a string, trim it
          if (typeof userData[key] === 'string') {
            const trimmed = userData[key].trim()
            if (trimmed !== '') {
              updateData[key] = trimmed
            }
          } else {
            updateData[key] = userData[key]
          }
        }
      })

      // Ensure userId is in correct format (string or number depending on backend)
      const updateUserId = userId ? String(userId) : null
      
      if (!updateUserId) {
        throw new Error(t('userIdNotFound'))
      }

      console.log('Updating user with data:', JSON.stringify(updateData, null, 2))
      console.log('User ID:', updateUserId)
      console.log('User ID type:', typeof updateUserId)

      // Update user using userId
      const response = await userService.update(updateUserId, updateData)
      
      console.log('User updated successfully:', response.data)
      
      // Refresh user data in AuthContext
      if (refreshUser) {
        await refreshUser()
      }
      
      toast.success(t('userUpdateSuccess'), {
        position: 'top-right',
        autoClose: 3000,
      })
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(-1) // Go back to previous page
      }, 2000)
    } catch (err) {
      console.error('User update error:', err)
      console.error('Error response:', err?.response)
      console.error('Error response data:', err?.response?.data)
      
      // Try to get detailed error message
      let errorMessage = t('userUpdateError')
      
      if (err?.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        } else if (err.response.data.errors) {
          // Handle validation errors
          const errors = err.response.data.errors
          if (Array.isArray(errors)) {
            errorMessage = errors.join(', ')
          } else if (typeof errors === 'object') {
            errorMessage = Object.values(errors).join(', ')
          }
        }
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container section">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', border: '1px solid #e5e5e5', borderRadius: '0.5rem', background: '#fff' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '2rem', color: '#9B724C' }}>
          {t('updateUserTitle')}
        </h1>

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

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Dynamically render fields based on API response */}
            {userFields.map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  {field.label} {field.required && <span style={{ color: '#c33' }}>*</span>}
                </label>
                <input 
                  type={field.type || 'text'} 
                  value={userData[field.key] || ''} 
                  onChange={updateField(field.key)} 
                  required={field.required}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #e5e5e5', 
                    borderRadius: '0.375rem', 
                    fontSize: '1rem' 
                  }} 
                />
              </div>
            ))}
            
            {/* Fallback to standard fields if no dynamic fields */}
            {userFields.length === 0 && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    {t('firstName')} <span style={{ color: '#c33' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={userData.firstName || ''} 
                    onChange={updateField('firstName')} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #e5e5e5', 
                      borderRadius: '0.375rem', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    {t('lastName')} <span style={{ color: '#c33' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={userData.lastName || ''} 
                    onChange={updateField('lastName')} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #e5e5e5', 
                      borderRadius: '0.375rem', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    {t('email')} <span style={{ color: '#c33' }}>*</span>
                  </label>
                  <input 
                    type="email" 
                    value={userData.email || ''} 
                    onChange={updateField('email')} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #e5e5e5', 
                      borderRadius: '0.375rem', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                    {t('phone')}
                  </label>
                  <input 
                    type="text" 
                    value={userData.phone || ''} 
                    onChange={updateField('phone')} 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #e5e5e5', 
                      borderRadius: '0.375rem', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>
              </>
            )}


            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                {t('newPassword')} ({t('newPasswordHint')})
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={userData.password}
                  onChange={updateField('password')}
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="btn" 
              style={{ 
                flex: 1, 
                background: '#6b7280', 
                color: '#fff',
                border: '1px solid #6b7280'
              }}
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1 }} 
              disabled={saving}
            >
              {saving ? t('updating') : t('update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

