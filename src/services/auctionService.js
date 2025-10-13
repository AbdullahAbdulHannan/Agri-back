import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auctionService = {
  // Create new auction with file uploads
  createAuction: async (auctionData) => {
    try {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(auctionData).forEach(key => {
        if (key !== 'images' && key !== 'documents') {
          formData.append(key, auctionData[key]);
        }
      });
      
      // Add images
      if (auctionData.images && auctionData.images.length > 0) {
        auctionData.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      // Add documents
      if (auctionData.documents && auctionData.documents.length > 0) {
        auctionData.documents.forEach((document) => {
          formData.append('documents', document);
        });
      }
      
      const response = await api.post('/auctions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create auction');
    }
  },

  // Get all auctions with filters
  getAllAuctions: async (params = {}) => {
    try {
      const response = await api.get('/auctions', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch auctions');
    }
  },

  // Get auction by ID
  getAuctionById: async (id) => {
    try {
      const response = await api.get(`/auctions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch auction');
    }
  },

  // Get user's own auctions
  getUserAuctions: async (params = {}) => {
    try {
      const response = await api.get('/auctions/owner/me', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user auctions');
    }
  },

  // Update auction
  updateAuction: async (id, updateData) => {
    try {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(updateData).forEach(key => {
        if (key !== 'images' && key !== 'documents') {
          formData.append(key, updateData[key]);
        }
      });
      
      // Add new images
      if (updateData.images && updateData.images.length > 0) {
        updateData.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      // Add new documents
      if (updateData.documents && updateData.documents.length > 0) {
        updateData.documents.forEach((document) => {
          formData.append('documents', document);
        });
      }
      
      const response = await api.put(`/auctions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update auction');
    }
  },

  // Delete auction
  deleteAuction: async (id) => {
    try {
      const response = await api.delete(`/auctions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete auction');
    }
  },

  // Place a bid
  placeBid: async (auctionId, bidAmount) => {
    try {
      const response = await api.post(`/auctions/${auctionId}/bid`, {
        bidAmount: parseInt(bidAmount)
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to place bid');
    }
  },

  // Get auction bids
  getAuctionBids: async (auctionId) => {
    try {
      const response = await api.get(`/auctions/${auctionId}/bids`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bids');
    }
  },

  // Search auctions
  searchAuctions: async (params = {}) => {
    try {
      const response = await api.get('/auctions/search', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search auctions');
    }
  },

  // Verify auction (admin only)
  verifyAuction: async (auctionId, verified) => {
    try {
      const response = await api.patch(`/auctions/${auctionId}/verify`, {
        verified
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify auction');
    }
  },

  // File management endpoints
  getStorageStats: async () => {
    try {
      const response = await api.get('/files/storage/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get storage stats');
    }
  },

  validateFile: async (fileName) => {
    try {
      const response = await api.get(`/files/validate/${fileName}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate file');
    }
  },

  deleteFile: async (filePath) => {
    try {
      const response = await api.delete(`/files/${filePath}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
  },

  getFileInfo: async (filePath) => {
    try {
      const response = await api.get(`/files/info/${filePath}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get file info');
    }
  },

  cleanupFiles: async () => {
    try {
      const response = await api.post('/files/cleanup');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cleanup files');
    }
  }
};

export default auctionService; 