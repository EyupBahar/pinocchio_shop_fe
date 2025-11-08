import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'

export function MiniCart() {
  const [open, setOpen] = useState(false)
  const { items, totals, removeItem } = useCart()
  const { t } = useI18n()
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="mini-cart">
      <button onClick={() => setOpen((v) => !v)} className="btn" style={{ position: 'relative', width: '124px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {count > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {count}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="mini-cart-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 600 }}>{t('cart')}</div>
            <button 
              onClick={() => setOpen(false)} 
              className="btn-icon-close"
              aria-label="Close cart"
            >
              ×
            </button>
          </div>
          <div className="mini-cart-list">
            {items.length === 0 ? (
              <div className="text-muted" style={{ fontSize: '.9rem' }}>{t('emptyCart')}</div>
            ) : (
              items.map((i) => (
                <div key={`${i.id}-${i.variantId}`} className="mini-cart-row">
                  <div className="mini-thumb">
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
                    <div style={{ fontSize: '.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.title}</div>
                    <div className="text-muted" style={{ fontSize: '.8rem' }}>{i.variantId} • x{i.quantity}</div>
                  </div>
                  <div style={{ fontSize: '.9rem', fontWeight: 600 }}>CHF {(i.price * i.quantity).toFixed(2)}</div>
                  <button 
                    onClick={() => removeItem(i.id, i.variantId)} 
                    style={{ 
                      color: '#dc2626', 
                      fontSize: '1.5rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '32px',
                      height: '32px'
                    }}
                    aria-label="Remove item"
                  >×</button>
                </div>
              ))
            )}
          </div>
          <div className="mini-cart-footer">
            <div className="text-muted" style={{ fontSize: '.9rem' }}>{t('subtotal')}</div>
            <div style={{ fontWeight: 600 }}>CHF {totals.subtotal.toFixed(2)}</div>
          </div>
          <div style={{ padding: '0 1rem 1rem 1rem' }}>
            <Link to="/cart" onClick={() => setOpen(false)} className="btn btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
              {t('checkout')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}


