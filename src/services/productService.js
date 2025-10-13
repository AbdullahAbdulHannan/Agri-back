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

// Product API functions
export const productService = {
  // Create a new product
  createProduct: async (productData) => {
    return apiCall('/products/create', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Get all products with optional filtering
  getProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiCall(`/products${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get products by type
  getProductsByType: async (type) => {
    return apiCall(`/products/type/${type}`);
  },

  // Get a specific product by ID
  getProductById: async (id) => {
    return apiCall(`/products/${id}`);
  },

  // Update a product
  updateProduct: async (id, productData) => {
    return apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Delete a product
  deleteProduct: async (id) => {
    return apiCall(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Get seller's products
  getSellerProducts: async (sellerId) => {
    return apiCall(`/products/seller/${sellerId}`);
  },

  // Reviews
  getProductReviews: async (productId) => {
    return apiCall(`/reviews/product/${productId}`);
  },

  addReview: async (productId, reviewData) => {
    return apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify({ ...reviewData, product: productId }),
    });
  },

  updateReview: async (reviewId, reviewData) => {
    return apiCall(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (reviewId) => {
    return apiCall(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }
};

// Image upload service
export const imageService = {
  uploadImage: async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File is too large. Maximum size is 5MB.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY || 'YOUR_IMGBB_API_KEY'}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.data.url;
  },
};

export default productService; 