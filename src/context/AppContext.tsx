import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CartItem {
  id: string; name: string; price: number; image: string; quantity: number; unit: string;
}
export interface User {
  id: string; name: string; email: string; phone: string; avatar?: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  cartItems: CartItem[];
  wishlist: string[];
  cartCount: number;
}

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH'; payload: boolean }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QTY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; payload: string };

const initialState: AppState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('medmeu_token'),
  cartItems: [],
  wishlist: [],
  cartCount: 0,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload };
    case 'SET_AUTH': return { ...state, isAuthenticated: action.payload };
    case 'ADD_TO_CART': {
      const exists = state.cartItems.find(i => i.id === action.payload.id);
      const items = exists
        ? state.cartItems.map(i => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.cartItems, { ...action.payload, quantity: 1 }];
      return { ...state, cartItems: items, cartCount: items.reduce((a, i) => a + i.quantity, 0) };
    }
    case 'REMOVE_FROM_CART': {
      const items = state.cartItems.filter(i => i.id !== action.payload);
      return { ...state, cartItems: items, cartCount: items.reduce((a, i) => a + i.quantity, 0) };
    }
    case 'UPDATE_CART_QTY': {
      const items = state.cartItems.map(i =>
        i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
      ).filter(i => i.quantity > 0);
      return { ...state, cartItems: items, cartCount: items.reduce((a, i) => a + i.quantity, 0) };
    }
    case 'CLEAR_CART': return { ...state, cartItems: [], cartCount: 0 };
    case 'TOGGLE_WISHLIST': {
      const wl = state.wishlist.includes(action.payload)
        ? state.wishlist.filter(id => id !== action.payload)
        : [...state.wishlist, action.payload];
      return { ...state, wishlist: wl };
    }
    default: return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
