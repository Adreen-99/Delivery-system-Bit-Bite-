import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

const initialState = {
  items: [],
  restaurantId: null,
  restaurantName: ''
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, restaurant } = action.payload

      // If adding from different restaurant, clear cart
      if (state.restaurantId && state.restaurantId !== restaurant.id) {
        return {
          items: [{ ...item, quantity: 1, menu_item: item }],
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        }
      }

      const existingIndex = state.items.findIndex(i => i.id === item.id)
      if (existingIndex >= 0) {
        const newItems = [...state.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1
        }
        return { ...state, items: newItems }
      }
      return {
        ...state,
        items: [...state.items, { ...item, quantity: 1, menu_item: item }],
        restaurantId: restaurant.id,
        restaurantName: restaurant.name
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(i => i.id !== action.payload)
      if (newItems.length === 0) {
        return initialState
      }
      return { ...state, items: newItems }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        const newItems = state.items.filter(i => i.id !== id)
        return newItems.length ? { ...state, items: newItems } : initialState
      }
      return {
        ...state,
        items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
      }
    }

    case 'CLEAR_CART':
      return initialState

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    const saved = localStorage.getItem('bitbite-cart')
    return saved ? JSON.parse(saved) : initialState
  })

  useEffect(() => {
    localStorage.setItem('bitbite-cart', JSON.stringify(state))
  }, [state])

  const addItem = (item, restaurant) => dispatch({ type: 'ADD_ITEM', payload: { item, restaurant } })
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const getTotal = () => {
    return state.items.reduce((sum, item) => sum + (item.price_sats * item.quantity), 0)
  }

  const getItemCount = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
