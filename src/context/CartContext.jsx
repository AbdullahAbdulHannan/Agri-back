import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        loading: false,
        error: null
      };
    case 'SET_SUMMARY':
      return {
        ...state,
        summary: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: action.payload.items || state.items,
        loading: false,
        error: null
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: action.payload.items || state.items,
        loading: false,
        error: null
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: action.payload.items || state.items,
        loading: false,
        error: null
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        summary: { itemCount: 0, totalItems: 0, totalPrice: 0, deliveryCharges: 0, grandTotal: 0 },
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'SET_ITEM_LOADING':
      return {
        ...state,
        itemLoadingStates: {
          ...state.itemLoadingStates,
          [action.payload.productId]: action.payload.loading
        }
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  summary: { itemCount: 0, totalItems: 0, totalPrice: 0, deliveryCharges: 0, grandTotal: 0 },
  loading: false,
  error: null,
  itemLoadingStates: {}
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
      loadCartSummary();
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated, user]);

  // Load cart items
  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await cartService.getCart();
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Load cart summary
  const loadCartSummary = async (lat = null, lng = null) => {
    try {
      const query = lat != null && lng != null ? `?lat=${lat}&lng=${lng}` : '';
      const response = await cartService.getCartSummary(query);
      dispatch({ type: 'SET_SUMMARY', payload: response.data });
    } catch (error) {
      console.error('Error loading cart summary:', error);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1, selectedTier = 0) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await cartService.addToCart(productId, quantity, selectedTier);
      dispatch({ type: 'ADD_ITEM', payload: response.data });
      await loadCartSummary(); // Refresh summary
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Update cart item
  const updateCartItem = async (productId, quantity, selectedTier) => {
    try {
      // Optimistically update the cart state immediately for better UX
      const currentItems = [...state.items];
      const itemIndex = currentItems.findIndex(item => item.product._id === productId);
      
      if (itemIndex !== -1) {
        currentItems[itemIndex] = {
          ...currentItems[itemIndex],
          quantity,
          selectedTier
        };
        
        // Update state immediately
        dispatch({ type: 'UPDATE_ITEM', payload: { items: currentItems } });
      }
      
      // Then make the API call
      const response = await cartService.updateCartItem(productId, quantity, selectedTier);
      
      // Update with server response to ensure consistency
      dispatch({ type: 'UPDATE_ITEM', payload: response.data });
      await loadCartSummary(); // Refresh summary
      
      return response;
    } catch (error) {
      // If API call fails, reload cart to revert optimistic update
      await loadCart();
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const response = await cartService.removeFromCart(productId);
      dispatch({ type: 'REMOVE_ITEM', payload: response.data });
      await loadCartSummary(); // Refresh summary
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Clear cart (optimistic)
  const clearCart = async () => {
    // Optimistically clear UI immediately
    dispatch({ type: 'CLEAR_CART' });
    try {
      await cartService.clearCart();
      // Also refresh summary to ensure all subscribers update consistently
      await loadCartSummary();
    } catch (error) {
      // If API fails, reload cart to recover and surface error
      await loadCart();
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Get item by product ID
  const getCartItem = (productId) => {
    return state.items.find(item => item.product._id === productId);
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItem,
    isInCart,
    loadCartSummary,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 