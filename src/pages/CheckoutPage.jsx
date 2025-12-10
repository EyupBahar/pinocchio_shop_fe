import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCart } from '../contexts/CartContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { orderService } from '../services/orderService.js'
import { authService } from '../services/authService.js'
import { decodeToken } from '../services/api.js'
import { sanitizeInput, sanitizeObject, clearSensitiveData } from '../utils/security.js'

export function CheckoutPage() {
  const { items, totals, clearCart } = useCart()
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState(null)
  const [useSameAddress, setUseSameAddress] = useState(true)
  const formRef = useRef(null)

  // Cleanup sensitive data on unmount
  useEffect(() => {
    return () => {
      // Clear sensitive address data
      setShipmentAddress({
        fullName: '',
        email: '',
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        phoneNumber: '',
        companyName: ''
      })
      setInvoiceAddress({
        fullName: '',
        email: '',
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        phoneNumber: '',
        companyName: ''
      })
    }
  }, [])

  useEffect(() => {
    if (items.length === 0) {
      console.warn('⚠️ CheckoutPage: Sepet boş! Sepete geri dönülüyor...')
      // Don't redirect automatically, let user see the message
    }
  }, [items])

  const [shipmentAddress, setShipmentAddress] = useState({
    fullName: '',
    email: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
    companyName: ''
  })

  const [invoiceAddress, setInvoiceAddress] = useState({
    fullName: '',
    email: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
    companyName: ''
  })

  // Get userId from user object first, then from profile or token
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // First, check if userId is already in user object (from login)
        if (user?.userId) {
          setUserId(user.userId)
          return
        }
        
        // If not in user object, try to get from token or profile API
        // First try to get token
        let token = localStorage.getItem('authToken')
        if (!token && typeof document !== 'undefined') {
          const cookies = document.cookie ? document.cookie.split('; ') : []
          for (const c of cookies) {
            const [k, v] = c.split('=')
            if (k === 'authToken') {
              token = decodeURIComponent(v)
              break
            }
          }
        }
        
        if (token) {
          // Try to get userId from token first (JWT decode)
          try {
            const decodedToken = decodeToken(token)
            if (decodedToken) {
              // Try different possible field names in token
              const idFromToken = decodedToken.sub || decodedToken.userId || decodedToken.user_id || decodedToken.id || decodedToken.nameid
              if (idFromToken) {
                // GUID formatında ise (string), olduğu gibi bırak
                // Number ise, number olarak gönder
                const userId = typeof idFromToken === 'number' 
                  ? idFromToken 
                  : (typeof idFromToken === 'string' && !isNaN(parseInt(idFromToken)) && !idFromToken.includes('-'))
                    ? parseInt(idFromToken, 10) 
                    : idFromToken // GUID veya string olarak kal
                setUserId(userId)
                return
              }
            }
          } catch (tokenErr) {
            // Could not decode token
          }

          // If not found in token, try profile API
          const profileRes = await authService.getProfile(token)
          const profile = profileRes?.data?.data || profileRes?.data || {}
          
          // Try different possible field names for userId
          const id = profile.id || profile.userId || profile.user_id || profile.sub || null
          if (id) {
            // GUID formatında ise (string), olduğu gibi bırak
            // Number ise, number olarak gönder
            const userId = typeof id === 'number' 
              ? id 
              : (typeof id === 'string' && !isNaN(parseInt(id)) && !id.includes('-'))
                ? parseInt(id, 10) 
                : id // GUID veya string olarak kal
            setUserId(userId)
        } else {
          console.warn('❌ UserId not found in profile. Available fields:', Object.keys(profile))
        }
      } else {
        console.warn('❌ No token found')
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(t('userInfoNotAvailable'))
    }
  }

  if (user) {
    fetchUserId()
  }
  }, [user])

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setShipmentAddress(prev => ({ ...prev, email: user.email }))
      setInvoiceAddress(prev => ({ ...prev, email: user.email }))
    }
  }, [user])

  // Copy shipment address to invoice address when checkbox is checked
  useEffect(() => {
    if (useSameAddress) {
      setInvoiceAddress({ ...shipmentAddress })
    }
  }, [useSameAddress, shipmentAddress])

  const handleShipmentAddressChange = (field) => (e) => {
    const sanitizedValue = sanitizeInput(e.target.value)
    setShipmentAddress(prev => ({ ...prev, [field]: sanitizedValue }))
    if (useSameAddress) {
      setInvoiceAddress(prev => ({ ...prev, [field]: sanitizedValue }))
    }
  }

  const handleInvoiceAddressChange = (field) => (e) => {
    const sanitizedValue = sanitizeInput(e.target.value)
    setInvoiceAddress(prev => ({ ...prev, [field]: sanitizedValue }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    
    // Basic validations
    if (items.length === 0) {
      setError(t('emptyCartMessage'))
      return
    }

    if (!user) {
      toast.error(t('pleaseRegisterToOrder'), {
        position: 'top-right',
        autoClose: 4000,
      })
      return
    }

    // userId GUID formatında olabilir (string) veya number olabilir
    // Backend'e olduğu gibi gönder, GUID ise string olarak kalmalı
    let finalUserId = userId
    if (userId === null || userId === undefined) {
      finalUserId = null
    } else {
      finalUserId = userId
    }

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'street', 'city', 'postalCode', 'country', 'phoneNumber']
    let hasValidationErrors = false
    const validationErrors = []
    
    for (const field of requiredFields) {
      if (!shipmentAddress[field] || shipmentAddress[field].trim() === '') {
        validationErrors.push(`${t('shipmentAddressField')} ${t('fieldMissing')}: ${t(field) || field}`)
        hasValidationErrors = true
      }
      if (!invoiceAddress[field] || invoiceAddress[field].trim() === '') {
        validationErrors.push(`${t('invoiceAddressField')} ${t('fieldMissing')}: ${t(field) || field}`)
        hasValidationErrors = true
      }
    }
    
    if (hasValidationErrors) {
      setError(t('pleaseFillRequiredFields') + ': ' + validationErrors.join(', '))
    }

    // Prepare order items - ensure all are numbers
    const orderItems = items.map(item => {
      const productId = typeof item.id === 'string' ? parseInt(item.id, 10) : Number(item.id)
      const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : Number(item.quantity)
      const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price)
      
      return {
        productId: isNaN(productId) ? 0 : productId,
        quantity: isNaN(quantity) ? 1 : quantity,
        price: isNaN(price) ? 0 : price
      }
    })

    // Clean and sanitize address objects
    const cleanAddress = (address) => {
      const cleaned = {}
      const defaultFields = {
        fullName: '',
        email: '',
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        phoneNumber: '',
        companyName: ''
      }
      
      Object.keys(defaultFields).forEach(key => {
        const value = address[key] || defaultFields[key]
        // Sanitize all address fields
        cleaned[key] = typeof value === 'string' ? sanitizeInput(value) : value
      })
      
      return cleaned
    }

    // Prepare order data with sanitized addresses
    const orderData = {
      userId: finalUserId,
      order_items: orderItems,
      shipmentAddress: cleanAddress(shipmentAddress),
      invoiceAddress: cleanAddress(invoiceAddress),
      status: 1,
      isPaid: false
    }
    
    // Validate order data before sending
    if (!finalUserId) {
      console.warn('⚠️ Warning: userId is null/undefined, backend might reject this')
    }
    if (!orderItems || orderItems.length === 0) {
      console.warn('⚠️ Warning: order_items is empty')
    }

    try {
      setLoading(true)
      
      await orderService.createOrder(orderData)
      
      // Clear sensitive data from memory
      clearSensitiveData(orderData)
      
      // Clear form addresses
      setShipmentAddress({
        fullName: '',
        email: '',
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        phoneNumber: '',
        companyName: ''
      })
      setInvoiceAddress({
        fullName: '',
        email: '',
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        phoneNumber: '',
        companyName: ''
      })
      
      // Clear cart and show success toast
      clearCart()
      toast.success(t('orderPlacedSuccessfully'), {
        position: 'top-right',
        autoClose: 3000,
      })
      navigate('/my-orders')
    } catch (err) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ Order creation error:', err)
      console.error('Error response:', err?.response?.data)
      console.error('Error status:', err?.response?.status)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Try to get more detailed error message
      let errorMessage = t('orderCreationError')
      let errorDetails = ''
      
      if (err?.response?.status === 500) {
        errorMessage = 'Sunucu hatası (500): Internal Server Error'
        errorDetails = 'Backend sunucusu bir hata döndü. Lütfen konsolu kontrol edin ve backend ekibine bildirin.'
        
        // Log the request that was sent
        console.error('📤 Gönderilen Order Data:')
        console.error(JSON.stringify(orderData, null, 2))
      } else if (err?.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data
        } else if (err.response.data.errors) {
          // If there are validation errors
          const errors = Object.values(err.response.data.errors).flat()
          errorMessage = errors.join(', ')
        }
      }
      
      setError(errorMessage + (errorDetails ? '\n\n' + errorDetails : ''))
      toast.error(t('errorOccurredToast') + ': ' + errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <h2 className="section-title"><span>{t('checkout')}</span></h2>
        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{t('emptyCartMessage')}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {t('emptyCartDescription')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/cart')} className="btn" style={{ marginTop: '1rem' }}>
            {t('backToCart')}
          </button>
          <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('continueShopping')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <h2 className="section-title"><span>{t('checkout')}</span></h2>

      {!user && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          color: '#92400e',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
              {t('pleaseRegisterToOrder')}
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            {t('login')}
          </button>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1.5rem',
          marginBottom: '1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: '0.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '0.75rem',
            fontWeight: 600,
            fontSize: '1.125rem'
          }}>
            <span>⚠️</span>
            <span>Hata Oluştu</span>
          </div>
          <div style={{ 
            marginBottom: '0.75rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            whiteSpace: 'pre-line'
          }}>
            {error}
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            padding: '0.75rem',
            background: '#fee2e2',
            borderRadius: '0.375rem',
            borderLeft: '3px solid #dc2626'
          }}>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
              🔍 Ne yapmalıyım?
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#7f1d1d' }}>
              <li>Browser console'u açın (F12) ve detaylı hata mesajını kontrol edin</li>
              <li>Gönderilen request body'yi ve backend response'unu inceleyin</li>
              <li>Backend ekibine bu hatayı bildirin</li>
              <li>Sayfayı yenileyip tekrar deneyebilirsiniz</li>
            </ul>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
              style={{ marginRight: '0.5rem' }}
            >
              Sayfayı Yenile
            </button>
            <button 
              onClick={() => navigate('/cart')} 
              className="btn"
            >
              Sepete Dön
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Shipment Address */}
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              {t('shipmentAddress')}
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  value={shipmentAddress.fullName}
                  onChange={handleShipmentAddressChange('fullName')}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('email')} *
                </label>
                <input
                  type="email"
                  value={shipmentAddress.email}
                  onChange={handleShipmentAddressChange('email')}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('companyNameOptional')}
                </label>
                <input
                  type="text"
                  value={shipmentAddress.companyName}
                  onChange={handleShipmentAddressChange('companyName')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('street')} *
                </label>
                <input
                  type="text"
                  value={shipmentAddress.street}
                  onChange={handleShipmentAddressChange('street')}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('city')} *
                </label>
                <input
                  type="text"
                  value={shipmentAddress.city}
                  onChange={handleShipmentAddressChange('city')}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('region')}
                </label>
                <input
                  type="text"
                  value={shipmentAddress.region}
                  onChange={handleShipmentAddressChange('region')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('postalCode')} *
                </label>
                <input
                  type="text"
                  value={shipmentAddress.postalCode}
                  onChange={handleShipmentAddressChange('postalCode')}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('country')} *
                </label>
                <input
                  type="text"
                  value={shipmentAddress.country}
                  onChange={handleShipmentAddressChange('country')}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('phoneNumber')} *
                </label>
                <input
                  type="tel"
                  value={shipmentAddress.phoneNumber}
                  onChange={handleShipmentAddressChange('phoneNumber')}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Invoice Address */}
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              {t('invoiceAddress')}
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <span>{t('useSameAddress')}</span>
              </label>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  value={invoiceAddress.fullName}
                  onChange={handleInvoiceAddressChange('fullName')}
                  required
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('email')} *
                </label>
                <input
                  type="email"
                  value={invoiceAddress.email}
                  onChange={handleInvoiceAddressChange('email')}
                  required
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('companyNameOptional')}
                </label>
                <input
                  type="text"
                  value={invoiceAddress.companyName}
                  onChange={handleInvoiceAddressChange('companyName')}
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('street')} *
                </label>
                <input
                  type="text"
                  value={invoiceAddress.street}
                  onChange={handleInvoiceAddressChange('street')}
                  required
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('city')} *
                </label>
                <input
                  type="text"
                  value={invoiceAddress.city}
                  onChange={handleInvoiceAddressChange('city')}
                  required
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('region')}
                </label>
                <input
                  type="text"
                  value={invoiceAddress.region}
                  onChange={handleInvoiceAddressChange('region')}
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('postalCode')} *
                </label>
                <input
                  type="text"
                  value={invoiceAddress.postalCode}
                  onChange={handleInvoiceAddressChange('postalCode')}
                  required
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('country')} *
                </label>
                <input
                  type="text"
                  value={invoiceAddress.country}
                  onChange={handleInvoiceAddressChange('country')}
                  required
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  {t('phoneNumber')} *
                </label>
                <input
                  type="tel"
                  value={invoiceAddress.phoneNumber}
                  onChange={handleInvoiceAddressChange('phoneNumber')}
                  required
                  disabled={useSameAddress}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    opacity: useSameAddress ? 0.6 : 1
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
            {t('orderSummary')}
          </h3>
          <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
            {items.map((item) => (
              <div key={`${item.id}-${item.variantId}`} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span>{item.title} x {item.quantity}</span>
                <span>CHF {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '2px solid #e5e7eb',
            fontSize: '1.125rem',
            fontWeight: 600
          }}>
            <span>{t('total')}:</span>
            <span>CHF {totals.subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="btn"
            disabled={loading}
          >
            {t('back')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || userId === null || userId === undefined || !user}
            onClick={() => {
              console.log('Button clicked!', { 
                loading, 
                userId, 
                user: !!user,
                disabled: loading || userId === null || userId === undefined || !user
              })
            }}
          >
            {loading ? t('submitting') : (userId === null || userId === undefined) ? t('loadingUserInfo') : t('completeOrder')}
          </button>
          {(userId === null || userId === undefined) && user && (
            <div style={{ fontSize: '0.875rem', color: '#f59e0b', marginTop: '0.5rem' }}>
              {t('loadingUserInfoConsole')}
            </div>
          )}
          {userId !== null && userId !== undefined && user && !loading && (
            <div style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.5rem' }}>
              {t('readyToComplete')}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

