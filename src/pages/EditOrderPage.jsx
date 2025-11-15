import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'
import { orderService } from '../services/orderService.js'

export function EditOrderPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [useSameAddress, setUseSameAddress] = useState(true)

  const [orderData, setOrderData] = useState({
    isPaid: false,
    status: 1,
    shipmentAddress: {
      fullName: '',
      email: '',
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      phoneNumber: '',
      companyName: ''
    },
    invoiceAddress: {
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
  })

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await orderService.getById(id)
        const order = response?.data?.data || response?.data || {}
        
        setOrderData({
          isPaid: order.isPaid || false,
          status: order.status || 1,
          shipmentAddress: order.shipmentAddress || {
            fullName: '',
            email: '',
            street: '',
            city: '',
            region: '',
            postalCode: '',
            country: '',
            phoneNumber: '',
            companyName: ''
          },
          invoiceAddress: order.invoiceAddress || {
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
        })

        // Check if addresses are the same
        const shipment = order.shipmentAddress || {}
        const invoice = order.invoiceAddress || {}
        const addressesMatch = 
          shipment.fullName === invoice.fullName &&
          shipment.email === invoice.email &&
          shipment.street === invoice.street &&
          shipment.city === invoice.city &&
          shipment.region === invoice.region &&
          shipment.postalCode === invoice.postalCode &&
          shipment.country === invoice.country &&
          shipment.phoneNumber === invoice.phoneNumber &&
          shipment.companyName === invoice.companyName
        
        setUseSameAddress(addressesMatch)
      } catch (err) {
        console.error('Error loading order:', err)
        setError(err?.response?.data?.message || 'Sipariş yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadOrder()
    }
  }, [id])

  // Copy shipment address to invoice address when checkbox is checked
  useEffect(() => {
    if (useSameAddress) {
      setOrderData(prev => ({
        ...prev,
        invoiceAddress: { ...prev.shipmentAddress }
      }))
    }
  }, [useSameAddress])

  const handleShipmentAddressChange = (field) => (e) => {
    const value = e.target.value
    setOrderData(prev => ({
      ...prev,
      shipmentAddress: { ...prev.shipmentAddress, [field]: value }
    }))
    if (useSameAddress) {
      setOrderData(prev => ({
        ...prev,
        invoiceAddress: { ...prev.invoiceAddress, [field]: value }
      }))
    }
  }

  const handleInvoiceAddressChange = (field) => (e) => {
    setOrderData(prev => ({
      ...prev,
      invoiceAddress: { ...prev.invoiceAddress, [field]: e.target.value }
    }))
  }

  const handleStatusChange = (e) => {
    setOrderData(prev => ({
      ...prev,
      status: Number(e.target.value)
    }))
  }

  const handleIsPaidChange = (e) => {
    setOrderData(prev => ({
      ...prev,
      isPaid: e.target.checked
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'street', 'city', 'postalCode', 'country', 'phoneNumber']
    for (const field of requiredFields) {
      if (!orderData.shipmentAddress[field]) {
        setError(`Lütfen teslimat adresindeki ${field} alanını doldurun`)
        return
      }
      if (!orderData.invoiceAddress[field]) {
        setError(`Lütfen fatura adresindeki ${field} alanını doldurun`)
        return
      }
    }

    try {
      setSaving(true)

      // Prepare update data (only the fields that can be updated)
      const updateData = {
        isPaid: orderData.isPaid,
        status: orderData.status,
        shipmentAddress: orderData.shipmentAddress,
        invoiceAddress: orderData.invoiceAddress
      }

      console.log('Updating order with data:', updateData)

      // Update order
      const response = await orderService.updateOrder(id, updateData)
      
      console.log('Order updated successfully:', response.data)
      
      toast.success(t('orderUpdatedSuccessfully'), {
        position: 'top-right',
        autoClose: 3000,
      })
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(-1) // Go back to previous page
      }, 2000)
    } catch (err) {
      console.error('Order update error:', err)
      const errorMessage = err?.response?.data?.message || 'Sipariş güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
      setError(errorMessage)
      toast.error(t('errorOccurredToast') + ': ' + errorMessage, {
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
        <h2 className="section-title"><span>Sipariş Düzenle</span></h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <h2 className="section-title"><span>Sipariş Düzenle</span></h2>

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

      <form onSubmit={handleSubmit}>
        {/* Order Status and Payment */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
            Sipariş Durumu
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Durum
              </label>
              <select
                value={orderData.status}
                onChange={handleStatusChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value={1}>Beklemede</option>
                <option value={2}>Hazırlanıyor</option>
                <option value={3}>Kargoda</option>
                <option value={4}>Teslim Edildi</option>
                <option value={5}>İptal Edildi</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="isPaid"
                checked={orderData.isPaid}
                onChange={handleIsPaidChange}
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              <label htmlFor="isPaid" style={{ cursor: 'pointer', fontWeight: 500 }}>
                Ödendi
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Shipment Address */}
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              Teslimat Adresi
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={orderData.shipmentAddress.fullName}
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
                  E-posta *
                </label>
                <input
                  type="email"
                  value={orderData.shipmentAddress.email}
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
                  Şirket Adı
                </label>
                <input
                  type="text"
                  value={orderData.shipmentAddress.companyName}
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
                  Sokak/Adres *
                </label>
                <input
                  type="text"
                  value={orderData.shipmentAddress.street}
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
                  Şehir *
                </label>
                <input
                  type="text"
                  value={orderData.shipmentAddress.city}
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
                  Bölge/Eyalet
                </label>
                <input
                  type="text"
                  value={orderData.shipmentAddress.region}
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
                  Posta Kodu *
                </label>
                <input
                  type="text"
                  value={orderData.shipmentAddress.postalCode}
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
                  Ülke *
                </label>
                <input
                  type="text"
                  value={orderData.shipmentAddress.country}
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
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  value={orderData.shipmentAddress.phoneNumber}
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
              Fatura Adresi
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <span>Teslimat adresi ile aynı</span>
              </label>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={orderData.invoiceAddress.fullName}
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
                  E-posta *
                </label>
                <input
                  type="email"
                  value={orderData.invoiceAddress.email}
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
                  Şirket Adı
                </label>
                <input
                  type="text"
                  value={orderData.invoiceAddress.companyName}
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
                  Sokak/Adres *
                </label>
                <input
                  type="text"
                  value={orderData.invoiceAddress.street}
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
                  Şehir *
                </label>
                <input
                  type="text"
                  value={orderData.invoiceAddress.city}
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
                  Bölge/Eyalet
                </label>
                <input
                  type="text"
                  value={orderData.invoiceAddress.region}
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
                  Posta Kodu *
                </label>
                <input
                  type="text"
                  value={orderData.invoiceAddress.postalCode}
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
                  Ülke *
                </label>
                <input
                  type="text"
                  value={orderData.invoiceAddress.country}
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
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  value={orderData.invoiceAddress.phoneNumber}
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

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn"
            disabled={saving}
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}








