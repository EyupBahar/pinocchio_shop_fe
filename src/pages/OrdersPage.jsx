import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { orderService } from '../services/orderService.js'

export function OrdersPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])
  
  const [filters, setFilters] = useState({
    userId: null,
    status: null,
    isPaid: null,
    startDate: null,
    endDate: null,
    pageNumber: 1,
    pageSize: 10
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  })

  useEffect(() => {
    loadOrders()
  }, [filters.pageNumber])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Prepare filter payload
      const filterPayload = {}
      if (filters.userId) filterPayload.userId = filters.userId
      if (filters.status !== null && filters.status !== '') filterPayload.status = filters.status
      if (filters.isPaid !== null && filters.isPaid !== '') filterPayload.isPaid = filters.isPaid
      if (filters.startDate) filterPayload.startDate = filters.startDate
      if (filters.endDate) filterPayload.endDate = filters.endDate
      filterPayload.pageNumber = filters.pageNumber
      filterPayload.pageSize = filters.pageSize

      const response = await orderService.getAllOrdersByFilter(filterPayload)
      const data = response?.data?.data || response?.data || {}
      
      setOrders(data.items || data.orders || [])
      setPagination({
        currentPage: data.currentPage || filters.pageNumber,
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0
      })
    } catch (err) {
      console.error('Error loading orders:', err)
      setError(err?.response?.data?.message || 'Siparişler yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? null : value,
      pageNumber: 1 // Reset to first page when filter changes
    }))
  }

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, pageNumber: 1 }))
    loadOrders()
  }

  const handleClearFilters = () => {
    setFilters({
      userId: null,
      status: null,
      isPaid: null,
      startDate: null,
      endDate: null,
      pageNumber: 1,
      pageSize: 10
    })
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, pageNumber: newPage }))
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

  if (loading && orders.length === 0) {
    return (
      <div className="container section">
        <h2 className="section-title"><span>Siparişler</span></h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <h2 className="section-title"><span>Siparişler</span></h2>

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

      {/* Filters */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '0.5rem'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
          Filtreler
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
              Kullanıcı ID
            </label>
            <input
              type="number"
              value={filters.userId || ''}
              onChange={handleFilterChange('userId')}
              placeholder="Kullanıcı ID"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
              Durum
            </label>
            <select
              value={filters.status || ''}
              onChange={handleFilterChange('status')}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Tümü</option>
              <option value="1">Beklemede</option>
              <option value="2">Hazırlanıyor</option>
              <option value="3">Kargoda</option>
              <option value="4">Teslim Edildi</option>
              <option value="5">İptal Edildi</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
              Ödeme Durumu
            </label>
            <select
              value={filters.isPaid === null ? '' : filters.isPaid ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value
                setFilters(prev => ({
                  ...prev,
                  isPaid: value === '' ? null : value === 'true',
                  pageNumber: 1
                }))
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Tümü</option>
              <option value="true">Ödendi</option>
              <option value="false">Ödenmedi</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={handleFilterChange('startDate')}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={handleFilterChange('endDate')}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={handleApplyFilters}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            Filtrele
          </button>
          <button
            onClick={handleClearFilters}
            className="btn"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Sipariş bulunamadı.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Toplam {pagination.totalCount} sipariş bulundu
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
                  transition: 'all 0.2s',
                  ':hover': {
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }
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
                      Sipariş #{order.id}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Tarih bilgisi yok'}
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
                        Ödendi
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Kullanıcı ID</div>
                    <div style={{ fontWeight: 500 }}>{order.userId || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Toplam</div>
                    <div style={{ fontWeight: 500 }}>
                      CHF {order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Teslimat Adresi</div>
                    <div style={{ fontWeight: 500 }}>
                      {order.shipmentAddress?.city || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Ürün Sayısı</div>
                    <div style={{ fontWeight: 500 }}>
                      {order.order_items?.length || 0} ürün
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn"
                style={{
                  padding: '0.5rem 1rem',
                  opacity: pagination.currentPage === 1 ? 0.5 : 1,
                  cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Önceki
              </button>
              <span style={{ padding: '0.5rem 1rem' }}>
                Sayfa {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn"
                style={{
                  padding: '0.5rem 1rem',
                  opacity: pagination.currentPage === pagination.totalPages ? 0.5 : 1,
                  cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}










