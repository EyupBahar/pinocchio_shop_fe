import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { orderService } from '../services/orderService.js'

export function OrderDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (id) {
      loadOrderDetails()
    }
  }, [id])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await orderService.getOrderDetails(id)
      const orderData = response?.data?.data || response?.data || {}
      setOrder(orderData)
    } catch (err) {
      console.error('Error loading order details:', err)
      setError(err?.response?.data?.message || 'Sipariş detayları yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      1: 'Beklemede',
      2: 'Hazırlanıyor',
      3: 'Kargoda',
      4: 'Teslim Edildi',
      5: 'İptal Edildi'
    }
    return statusMap[status] || `Durum ${status}`
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

  if (loading) {
    return (
      <div className="container section">
        <h2 className="section-title"><span>Sipariş Detayları</span></h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="container section">
        <h2 className="section-title"><span>Sipariş Detayları</span></h2>
        <div style={{
          padding: '1rem',
          background: '#fee',
          color: '#c33',
          borderRadius: '0.5rem'
        }}>
          {error}
        </div>
        <button onClick={() => navigate(-1)} className="btn" style={{ marginTop: '1rem' }}>
          Geri Dön
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container section">
        <h2 className="section-title"><span>Sipariş Detayları</span></h2>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Sipariş bulunamadı.
        </div>
        <button onClick={() => navigate(-1)} className="btn" style={{ marginTop: '1rem' }}>
          Geri Dön
        </button>
      </div>
    )
  }

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <span>Sipariş Detayları #{order.id}</span>
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate(`/order/${order.id}/edit`)}
            className="btn btn-primary"
          >
            Düzenle
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn"
          >
            Geri Dön
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#fee',
          color: '#c33',
          borderRadius: '0.5rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Order Info */}
        <div style={{
          padding: '1.5rem',
          background: '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
            Sipariş Bilgileri
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Sipariş ID</div>
              <div style={{ fontWeight: 500 }}>#{order.id}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Kullanıcı ID</div>
              <div style={{ fontWeight: 500 }}>{order.userId || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Durum</div>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: getStatusColor(order.status) + '20',
                  color: getStatusColor(order.status),
                  display: 'inline-block'
                }}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Ödeme Durumu</div>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: order.isPaid ? '#10b98120' : '#ef444420',
                  color: order.isPaid ? '#10b981' : '#ef4444',
                  display: 'inline-block'
                }}
              >
                {order.isPaid ? 'Ödendi' : 'Ödenmedi'}
              </span>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Oluşturulma Tarihi</div>
              <div style={{ fontWeight: 500 }}>
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </div>
            </div>
            {order.updatedAt && (
              <div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Güncellenme Tarihi</div>
                <div style={{ fontWeight: 500 }}>
                  {new Date(order.updatedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <div style={{
            padding: '1.5rem',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              Sipariş Ürünleri
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {order.order_items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                      Ürün ID: {item.productId}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Miktar: {item.quantity} x CHF {item.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                    CHF {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            {order.totalAmount && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                <span>Toplam:</span>
                <span>CHF {order.totalAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Addresses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Shipment Address */}
          {order.shipmentAddress && (
            <div style={{
              padding: '1.5rem',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
                Teslimat Adresi
              </h3>
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                {order.shipmentAddress.fullName && (
                  <div><strong>{order.shipmentAddress.fullName}</strong></div>
                )}
                {order.shipmentAddress.companyName && (
                  <div>{order.shipmentAddress.companyName}</div>
                )}
                {order.shipmentAddress.street && (
                  <div>{order.shipmentAddress.street}</div>
                )}
                {(order.shipmentAddress.postalCode || order.shipmentAddress.city) && (
                  <div>
                    {order.shipmentAddress.postalCode} {order.shipmentAddress.city}
                  </div>
                )}
                {order.shipmentAddress.region && (
                  <div>{order.shipmentAddress.region}</div>
                )}
                {order.shipmentAddress.country && (
                  <div>{order.shipmentAddress.country}</div>
                )}
                {order.shipmentAddress.phoneNumber && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Tel:</strong> {order.shipmentAddress.phoneNumber}
                  </div>
                )}
                {order.shipmentAddress.email && (
                  <div>
                    <strong>E-posta:</strong> {order.shipmentAddress.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice Address */}
          {order.invoiceAddress && (
            <div style={{
              padding: '1.5rem',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
                Fatura Adresi
              </h3>
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                {order.invoiceAddress.fullName && (
                  <div><strong>{order.invoiceAddress.fullName}</strong></div>
                )}
                {order.invoiceAddress.companyName && (
                  <div>{order.invoiceAddress.companyName}</div>
                )}
                {order.invoiceAddress.street && (
                  <div>{order.invoiceAddress.street}</div>
                )}
                {(order.invoiceAddress.postalCode || order.invoiceAddress.city) && (
                  <div>
                    {order.invoiceAddress.postalCode} {order.invoiceAddress.city}
                  </div>
                )}
                {order.invoiceAddress.region && (
                  <div>{order.invoiceAddress.region}</div>
                )}
                {order.invoiceAddress.country && (
                  <div>{order.invoiceAddress.country}</div>
                )}
                {order.invoiceAddress.phoneNumber && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Tel:</strong> {order.invoiceAddress.phoneNumber}
                  </div>
                )}
                {order.invoiceAddress.email && (
                  <div>
                    <strong>E-posta:</strong> {order.invoiceAddress.email}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}











