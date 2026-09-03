import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { cartService } from '../services/cart.service';

export interface CartItem {
  id: string; name: string; price: number; image: string; quantity: number; unit: string;
}
export interface User {
  id: string; name: string; email: string; phone: string; avatar?: string;
  /** No native WooCommerce field — stored as customer meta_data on the backend. */
  dob?: string;
  gender?: string;
  /** All three come from WooCommerce's billing address sub-object. */
  city?: string;
  state?: string;
  pincode?: string;
  /** Real WooCommerce customer creation date — used for a real "Member Since" display. */
  memberSince?: string;
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
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; payload: string };

/**
 * Was: user always started as `null`, even when isAuthenticated was
 * already true from a cached token — so on refresh the app "knew" you
 * were logged in but had nothing to show for your profile until
 * something re-fetched it. Hydrate from the same localStorage cache
 * authService already writes to on login/register, same as
 * isAuthenticated already does below.
 */
function getCachedUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('medmeu_user') || 'null');
  } catch {
    return null;
  }
}

const initialState: AppState = {
  user: getCachedUser(),
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
      // Kept for compatibility, but no longer the recommended path — see
      // addToCart() below, which persists to the backend and then
      // dispatches SET_CART with the server-confirmed cart instead of
      // this local-only optimistic update.
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
    // Replaces cartItems wholesale with whatever the backend confirmed
    // is actually persisted — this is what addToCart/removeFromCart/
    // updateCartQty/loadCart/clearCart below dispatch after every API
    // call, so the client never shows a state the server doesn't agree with.
    case 'SET_CART': {
      const items = action.payload;
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

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  /** Fetches the customer's persisted cart from the backend and syncs local state to it. Call this once after login and on app mount when already authenticated. */
  loadCart: () => Promise<void>;
  /** Adds an item (or increments it if already present) via the backend, then syncs local state to the server-confirmed result. */
  addToCart: (item: CartItem) => Promise<void>;
  /** Removes a single item via the backend, then syncs local state. */
  removeFromCart: (id: string) => Promise<void>;
  /** Updates an item's quantity via the backend (0 or less removes it server-side too), then syncs local state. */
  updateCartQty: (id: string, quantity: number) => Promise<void>;
  /** Clears the whole cart via the backend, then syncs local state. */
  clearCart: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // All five of these follow the same shape: call the backend first,
  // then dispatch SET_CART with what the server actually confirmed —
  // never optimistically update local state first. This mirrors the
  // writeAndVerify() lesson from the addresses/cart backend work: a
  // request "succeeding" isn't the same as the data actually being
  // persisted, so the UI should reflect the server's confirmed state,
  // not what the client assumed would happen.

  async function loadCart() {
    const items = await cartService.list();
    dispatch({ type: 'SET_CART', payload: items });
  }

  async function addToCart(item: CartItem) {
    const items = await cartService.add(item);
    dispatch({ type: 'SET_CART', payload: items });
  }

  async function removeFromCart(id: string) {
    const items = await cartService.remove(id);
    dispatch({ type: 'SET_CART', payload: items });
  }

  async function updateCartQty(id: string, quantity: number) {
    const items = await cartService.updateQuantity(id, quantity);
    dispatch({ type: 'SET_CART', payload: items });
  }

  async function clearCart() {
    const items = await cartService.clear();
    dispatch({ type: 'SET_CART', payload: items });
  }

  return (
    <AppContext.Provider value={{ state, dispatch, loadCart, addToCart, removeFromCart, updateCartQty, clearCart }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}