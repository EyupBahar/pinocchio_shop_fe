import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'

export function MiniCart({ isOpen, onClose }) {
  const { items, totals, removeItem, updateQuantity } = useCart()
  const { t } = useI18n()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.3)'
        }}
        onClick={onClose}
      />
      {/* Cart Popup */}
      <div style={{
        position: 'fixed',
        top: '75px',
        right: '1rem',
        width: '400px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{t('cart')}</div>
          <button 
            onClick={onClose} 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '0.25rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>
        <div style={{ 
          overflowY: 'auto', 
          flex: 1,
          padding: '1rem'
        }}>
          {items.length === 0 ? (
            <div style={{ fontSize: '.9rem', color: '#6b7280', textAlign: 'center', padding: '2rem' }}>{t('emptyCart')}</div>
          ) : (
            items.map((i) => (
              <div 
                key={`${i.id}-${i.variantId}`} 
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  flexShrink: 0,
                  borderRadius: '0.375rem',
                  overflow: 'hidden',
                  background: '#f3f4f6'
                }}>
                  <img 
                    src={i.image || i.imageUrl || i.picture || 'https://via.placeholder.com/150?text=No+Image'} 
                    alt={i.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.9rem', fontWeight: 500, marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i.title}
                  </div>
                  <div style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    CHF {(i.price * i.quantity).toFixed(2)}
                  </div>
                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        if (i.quantity > 1) {
                          updateQuantity(i.id, i.variantId, i.quantity - 1)
                        } else {
                          removeItem(i.id, i.variantId)
                        }
                      }}
                      style={{
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '1.125rem',
                        color: '#374151',
                        padding: 0
                      }}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span style={{ 
                      minWidth: '2rem', 
                      textAlign: 'center', 
                      fontSize: '.875rem',
                      fontWeight: 500
                    }}>
                      {i.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(i.id, i.variantId, i.quantity + 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '1.125rem',
                        color: '#374151',
                        padding: 0
                      }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => removeItem(i.id, i.variantId)} 
                      style={{ 
                        marginLeft: 'auto',
                        color: '#dc2626', 
                        fontSize: '1.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '0.25rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fee'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <>
            <div style={{ 
              padding: '1rem', 
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '.9rem', color: '#6b7280' }}>{t('subtotal')}</div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>CHF {totals.subtotal.toFixed(2)}</div>
            </div>
            <div style={{ padding: '0 1rem 1rem 1rem' }}>
              <Link 
                to="/checkout" 
                onClick={onClose}
                className="btn btn-primary" 
                style={{ 
                  display: 'inline-flex', 
                  justifyContent: 'center', 
                  width: '100%'
                }}
              >
                {t('checkout')}
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}


