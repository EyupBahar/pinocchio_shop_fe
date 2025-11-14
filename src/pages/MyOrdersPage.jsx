import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { orderService } from '../services/orderService.js'
import { authService } from '../services/authService.js'
import { decodeToken } from '../services/api.js'

export function MyOrdersPage() {
  const { user } = useAuth()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])
  const [userId, setUserId] = useState(null)

  // Get userId from user object first (from login customerId), then from profile or token
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // First, check if userId is already in user object (from login customerId)
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
            setError(t('userIdNotFound'))
          }
        } else {
          console.warn('❌ No token found')
          setError(t('sessionNotFound'))
        }
      } catch (err) {
        console.error('❌ Error fetching user profile:', err)
        setError(t('userInfoNotAvailable'))
      }
    }

    if (user) {
      fetchUserId()
    }
  }, [user])

  // Load orders when userId is available - DIRECT API CALL
  useEffect(() => {
    if (!userId || userId === null || userId === undefined) {
      return
    }
    
    // userId GUID formatında olabilir, string olarak gönder
    const userIdParam = typeof userId === 'string' ? userId : String(userId)
    
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError('')
        
        // DIRECT API CALL - GetUserOrders
        const response = await orderService.getUserOrders(userIdParam)
        
        const data = response?.data?.data || response?.data || {}
        
        // Handle different response formats and extract orders array
        let ordersArray = []
        if (Array.isArray(data)) {
          ordersArray = data
        } else if (data.items) {
          ordersArray = data.items
        } else if (data.orders) {
          ordersArray = data.orders
        } else {
          ordersArray = []
        }
        
        // Sort orders by createdAt (newest first - descending order)
        const sortedOrders = ordersArray.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA // Descending order (newest first)
        })
        
        setOrders(sortedOrders)
      } catch (err) {
        console.error('❌ GetUserOrders API hatası:', err)
        console.error('Error details:', {
          status: err?.response?.status,
          data: err?.response?.data,
          userId: userIdParam,
          url: err?.config?.url,
          method: err?.config?.method,
          fullError: err
        })
        
        // Try to get more detailed error message
        let errorMessage = t('errorLoadingOrders')
        
        if (err?.response?.data) {
          const errorData = err.response.data
          
          // Handle different error response formats
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          } else if (errorData.title) {
            errorMessage = errorData.title
          } else if (errorData.errors) {
            const errors = Object.values(errorData.errors).flat()
            errorMessage = errors.join(', ')
          }
        }
        
        // If 500 error, show more helpful message
        if (err?.response?.status === 500) {
          const errorData = err?.response?.data || {}
          const backendMessage = errorData.message || errorData.error || 'Internal Server Error'
          
          errorMessage = `${t('backendServerError')}: ${backendMessage}`
          
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('❌ 500 Internal Server Error - Backend Hatası')
          console.error('API URL:', err?.config?.baseURL + err?.config?.url)
          console.error('Backend Message:', backendMessage)
          console.error('Error Data:', errorData)
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('💡 Bu bir backend hatası. Backend ekibine bildirin!')
        } else if (err?.response?.status === 404) {
          errorMessage = t('apiEndpointNotFound')
        }
        
        setError(errorMessage)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    
    // Call immediately
    fetchOrders()
  }, [userId])

  const getStatusLabel = (status) => {
    const statusMap = {
      1: t('statusPending'),
      2: t('statusPreparing'),
      3: t('statusShipping'),
      4: t('statusDelivered'),
      5: t('statusCancelled')
    }
    return statusMap[status] || `${t('statusUnknown')} ${status}`
  }

  const getStatusColor = (status) => {
    const colorMap = {
      1: '#f59e0b', // amber
      2: '#3b82f6', // blue
      3: '#8b5cf6', // purple
      4: '#10b981', // green
      5: '#ef4444' // red
    }
    return colorMap[status] || '#6b7280'
  }

  if (!user) {
    return (
      <div className="container section">
        <h2 className="section-title"><span>{t('myOrders')}</span></h2>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          {t('pleaseLoginToViewOrders')}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            {t('login')}
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container section">
        <h2 className="section-title"><span>{t('myOrders')}</span></h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>{t('loadingOrders')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <h2 className="section-title"><span>{t('myOrders')}</span></h2>

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
            <span>{t('errorOccurred')}</span>
          </div>
          <div style={{ 
            marginBottom: '0.75rem',
            fontSize: '1rem',
            lineHeight: '1.5'
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
              🔍 {t('whatShouldIDo')}
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#7f1d1d' }}>
              <li>{t('backendServerError')}</li>
              <li>{t('apiCallSuccessfulButBackendError')}</li>
              <li>{t('pleaseReportToBackendTeam')}</li>
              <li>{t('refreshAndTryAgain')}</li>
            </ul>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
              style={{ marginRight: '0.5rem' }}
            >
              {t('refreshPage')}
            </button>
            <button 
              onClick={() => navigate('/shop')} 
              className="btn"
            >
              {t('backToShopping')}
            </button>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('noOrdersYet')}</div>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => navigate('/shop')} className="btn btn-primary">
              {t('startShopping')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>
            {orders.length === 1 
              ? `1 ${t('orderFound')}` 
              : `${orders.length} ${t('ordersFound')}`}
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {t('orderNumber')} #{order.id}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {t('orderTime')}: {order.createdAt ? (() => {
                        const localeMap = {
                          de: 'de-DE',
                          en: 'en-US',
                          fr: 'fr-FR',
                          it: 'it-IT'
                        }
                        const locale = localeMap[lang] || 'en-US'
                        return new Date(order.createdAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      })() : t('dateInfoNotAvailable')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status)
                      }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                    {order.isPaid && (
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: '#10b98120',
                          color: '#10b981'
                        }}
                      >
                        {t('paid')}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{t('totalAmount')}</div>
                    <div style={{ fontWeight: 500 }}>
                      CHF {(() => {
                        const totalPrice = order.totalPrice || order.totalAmount || 0
                        const numPrice = typeof totalPrice === 'number' ? totalPrice : parseFloat(totalPrice) || 0
                        return numPrice.toFixed(2)
                      })()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{t('deliveryAddress')}</div>
                    <div style={{ fontWeight: 500 }}>
                      {[order.shipmentAddress?.street, order.shipmentAddress?.city].filter(Boolean).join(', ') || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{t('productCount')}</div>
                    <div style={{ fontWeight: 500 }}>
                      {order.order_items?.length || 0} {order.order_items?.length === 1 ? t('product') : t('products')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

