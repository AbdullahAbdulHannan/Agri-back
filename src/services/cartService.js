const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Cart API functions
export const cartService = {
  // Get user's cart
  getCart: async () => {
    return apiCall('/cart');
  },

  // Get cart summary (count and total) with optional query string containing lat/lng
  getCartSummary: async (lat = null, lng = null) => {
    let query = '';
    if (lat != null && lng != null) {
      query = `?lat=${lat}&lng=${lng}`;
      console.log('Fetching cart summary with coordinates:', { lat, lng });
    } else {
      console.log('Fetching cart summary without coordinates');
    }
    
    try {
      const result = await apiCall(`/cart/summary${query}`);
      console.log('Cart summary response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1, selectedTier = 0) => {
    return apiCall('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        selectedTier
      }),
    });
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity, selectedTier) => {
    return apiCall(`/cart/item/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        quantity,
        selectedTier
      }),
    });
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    return apiCall(`/cart/item/${productId}`, {
      method: 'DELETE',
    });
  },

  // Clear entire cart
  clearCart: async () => {
    return apiCall('/cart/clear', {
      method: 'DELETE',
    });
  },
};

export default cartService; 