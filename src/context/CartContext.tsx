import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'folklane_cart'

export type CartItem = {
  id: string
  title: string
  price: number
  image: string
  brand: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage write errors (e.g. private mode).
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(loadCart())
  }, [])

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (!item.id || quantity <= 0) return
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p,
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (!id) return
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((p) => p.id !== id)
      }
      return prev.map((p) => (p.id === id ? { ...p, quantity } : p))
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  const clearCart = () => setItems([])

  const totals = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    )
    return { totalItems, totalPrice }
  }, [items])

  const value: CartContextValue = {
    items,
    totalItems: totals.totalItems,
    totalPrice: totals.totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
