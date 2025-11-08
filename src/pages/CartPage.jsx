import { useCart } from '../contexts/CartContext.jsx'
import { useI18n } from '../contexts/I18nContext.jsx'

export function CartPage() {
  const { items, removeItem, updateQuantity, totals, clearCart } = useCart()
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
                <div style={{ flex: 1 }}>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-neutral-600">{i.variantId}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    onClick={() => updateQuantity(i.id, i.variantId, Math.max(1, i.quantity - 1))}
                    className="btn"
                    style={{
                      minWidth: "2.5rem",
                      height: "2.5rem",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem"
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
                    style={{ textAlign: "center", width: "4rem" }}
                  />
                  <button
                    onClick={() => updateQuantity(i.id, i.variantId, i.quantity + 1)}
                    className="btn"
                    style={{
                      minWidth: "2.5rem",
                      height: "2.5rem",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem"
                    }}
                  >
                    +
                  </button>
                </div>
                <div className="cart-price">CHF {(i.price * i.quantity).toFixed(2)}</div>
                <button onClick={() => removeItem(i.id, i.variantId)} className="btn">{t('removeFromCart')}</button>
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


