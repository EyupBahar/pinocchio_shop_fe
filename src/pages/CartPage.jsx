import { useCart } from '../contexts/CartContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'

export function CartPage() {
  const { items, removeItem, updateQuantity, totals, clearCart } = useCart()
  console.log("🚀 ~ CartPage ~ items:", items)
  const { t } = useI18n()

  return (
    <div className="container section">
      <h2 className="section-title"><span>{t('cart')}</span></h2>
      {items.length === 0 ? (
        <div>{t('emptyCart')}</div>
      ) : (
        <div className="cart-layout">
          <div style={{ display: 'grid', gap: '1rem' }}>
            {items.map((i) => (
              <div key={`${i.id}-${i.variantId}`} className="cart-item">
                <div className="cart-thumb"><img src={i.image} alt={i.title} className="block w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image'; }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-medium" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{i.title}</div>
                  <div className="text-sm text-neutral-600" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{i.variantId}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => updateQuantity(i.id, i.variantId, Math.max(1, i.quantity - 1))}
                    className="btn"
                    style={{
                      minWidth: "clamp(2rem, 5vw, 2.5rem)",
                      height: "clamp(2rem, 5vw, 2.5rem)",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "clamp(1rem, 3vw, 1.2rem)"
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => updateQuantity(i.id, i.variantId, Math.max(1, Number(e.target.value)))}
                    className="qty"
                    style={{ textAlign: "center", width: "clamp(3rem, 8vw, 4rem)", fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                  />
                  <button
                    onClick={() => updateQuantity(i.id, i.variantId, i.quantity + 1)}
                    className="btn"
                    style={{
                      minWidth: "clamp(2rem, 5vw, 2.5rem)",
                      height: "clamp(2rem, 5vw, 2.5rem)",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "clamp(1rem, 3vw, 1.2rem)"
                    }}
                  >
                    +
                  </button>
                </div>
                <div className="cart-price">CHF {(i.price * i.quantity).toFixed(2)}</div>
                <button onClick={() => removeItem(i.id, i.variantId)} className="btn" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)' }}>{t('removeFromCart')}</button>
              </div>
            ))}
          </div>
          <aside className="aside">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('subtotal')}</span>
              <span>CHF {totals.subtotal.toFixed(2)}</span>
            </div>
            <button onClick={clearCart} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>{t('checkout')}</button>
          </aside>
        </div>
      )}
    </div>
  )
}


