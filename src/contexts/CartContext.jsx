import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'pinocchio_cart_v1'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(product, variantId, quantity) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id && i.variantId === variantId)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity }
        return copy
      }
      return [...prev, { id: product.id, title: product.title, price: product.price, image: product.image, variantId, quantity }]
    })
  }

  function removeItem(id, variantId) {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.variantId === variantId)))
  }

  function updateQuantity(id, variantId, quantity) {
    setItems((prev) => prev.map((i) => (i.id === id && i.variantId === variantId ? { ...i, quantity } : i)))
  }

  function clearCart() {
    setItems([])
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return { subtotal }
  }, [items])

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totals }),
    [items, totals]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


