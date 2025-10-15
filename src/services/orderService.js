import apiCall from './apiCall';

export const orderService = {
  // -------------------------
  // Buyer flows
  // -------------------------

  // Create escrow order (cart checkout → multi-seller PaymentIntents)
  createEscrowOrder: async (orderData) => {
    return apiCall('/orders/create', {
      method: 'POST',
      body: JSON.stringify({
        ...orderData,
        paymentMethod: 'card',
      }),
    });
  },

  // Create a regular (non-escrow) order if needed
  createOrder: async (orderData) => {
    return apiCall('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Confirm payment for an order (single PaymentIntent ID)
  confirmPayment: async (orderId, paymentIntentId) => {
    return apiCall('/orders/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        paymentIntentId,
      }),
    });
  },

  // Get all orders of the logged-in buyer
  getUserOrders: async () => {
    return apiCall('/orders/user-orders');
  },

  // Get details of a specific order
  getOrderDetails: async (orderId) => {
    return apiCall(`/orders/${orderId}`);
  },

  // Cancel whole order (buyer)
  cancelOrder: async (orderId) => {
    return apiCall(`/orders/${orderId}/cancel`, {
      method: 'PUT',
    });
  },

  // -------------------------
  // Seller flows
  // -------------------------

  // Get orders for the current seller (each order will contain only this seller’s sellerOrder)
  getSellerOrders: async () => {
    return apiCall('/orders/seller-orders');
  },

  // Update seller’s own sub-order status
  updateSellerOrderStatus: async (orderId, { status, notes }) => {
    return apiCall(`/orders/${orderId}/seller-status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  },

  // -------------------------
  // Escrow actions
  // -------------------------

  // Buyer: release escrow funds (optionally to one seller only)
  releaseEscrowFunds: async (orderId, sellerId = null) => {
    return apiCall(`/escrow/orders/${orderId}/release`, {
      method: 'POST',
      body: JSON.stringify(sellerId ? { sellerId } : {}),
    });
  },

  // Buyer: raise a dispute (optionally tied to a seller)
  raiseDispute: async (orderId, reason, description, sellerId = null) => {
    return apiCall(`/escrow/orders/${orderId}/disputes`, {
      method: 'POST',
      body: JSON.stringify({ reason, description, sellerId }),
    });
  },

  // Admin: resolve a dispute
  resolveDispute: async (orderId, resolution) => {
    return apiCall(`/escrow/orders/${orderId}/disputes/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    });
  },
};