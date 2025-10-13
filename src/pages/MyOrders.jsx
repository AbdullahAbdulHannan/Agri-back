import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocalAtm as EscrowIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { orderService } from '../services/orderService';
import { useAuth } from '../context';
import EscrowStatusCard from '../components/orders/EscrowStatusCard';
import RaiseDisputeDialog from '../components/orders/RaiseDisputeDialog';

const statusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'confirmed':
      return 'primary';
    case 'shipped':
      return 'secondary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'held_in_escrow':
      return 'info';
    case 'released':
      return 'success';
    case 'disputed':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const MyOrders = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getUserOrders();
        // Process orders to ensure proper escrow status
        const processedOrders = res.data.orders.map(order => {
          // Skip if no escrow details
          if (!order.escrowDetails) return order;
          
          // Ensure releasedSellers is an array
          const releasedSellers = Array.isArray(order.escrowDetails.releasedSellers) 
            ? order.escrowDetails.releasedSellers 
            : [];
            
          // Update seller orders with escrow status
          const updatedSellerOrders = order.sellerOrders?.map(sellerOrder => {
            const sellerId = sellerOrder.seller?._id || sellerOrder.seller;
            const isReleased = releasedSellers.includes(sellerId?.toString());
            
            return {
              ...sellerOrder,
              escrowStatus: isReleased ? 'released' : (sellerOrder.escrowStatus || 'held')
            };
          }) || [];
          
          return {
            ...order,
            sellerOrders: updatedSellerOrders,
            escrowDetails: {
              ...order.escrowDetails,
              releasedSellers
            }
          };
        });
        
        setOrders(processedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  const handleRaiseDispute = (order) => {
    setSelectedOrder(order);
    setDisputeDialogOpen(true);
  };

  const handleReleaseEscrow = async (orderId, sellerId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Releasing escrow for order:', orderId, 'seller:', sellerId);
      
      const response = await orderService.releaseEscrowFunds(orderId, sellerId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to release funds');
      }
      
      // If we have the updated order in the response, use it
      if (response.order) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === response.order._id ? response.order : order
          )
        );
      } else {
        // Fallback: Refresh the orders list
        const res = await orderService.getUserOrders();
        setOrders(res.data.orders);
      }
      
      setSuccess(response.message || 'Funds released successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error releasing escrow:', {
        error: err,
        response: err.response?.data,
        orderId,
        sellerId
      });
      
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to release funds. Please try again.';
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDispute = async ({ reason, description }) => {
    try {
      setLoading(true);
      await orderService.raiseDispute(selectedOrder._id, reason, description);
      
      // Refresh orders
      const res = await orderService.getUserOrders();
      setOrders(res.data.orders);
      
      setDisputeDialogOpen(false);
      setSuccess('Dispute submitted successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit dispute');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
        Please sign in to view your orders.
      </Typography>
    );
  }

  if (loading && !orders.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!orders.length) {
    return (
      <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
        You have no orders yet.
      </Typography>
    );
  }

  const hasEscrowOrders = orders.some(order => order.paymentStatus?.includes('escrow') || order.escrowDetails);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          My Orders
        </Typography>
        {hasEscrowOrders && (
          <Box display="flex" alignItems="center">
            <Tooltip title="Orders with escrow protection have funds held securely until you confirm receipt and satisfaction">
              <IconButton size="small">
                <InfoIcon color="action" />
              </IconButton>
            </Tooltip>
            <Chip 
              icon={<EscrowIcon />} 
              label="Escrow Protected" 
              color="info" 
              variant="outlined" 
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {orders.map((order) => {
        const hasEscrow = order.escrowDetails || order.paymentStatus?.includes('escrow');
        
        // Group items by seller for display
        const sellerGroups = (order.sellerOrders && order.sellerOrders.length)
          ? order.sellerOrders
          : (() => {
              const map = new Map();
              (order.items || []).forEach((it) => {
                const sid = (it.seller?._id || it.seller || 'unknown').toString();
                if (!map.has(sid)) map.set(sid, { seller: it.seller, items: [], subtotal: 0, status: order.status });
                const g = map.get(sid);
                g.items.push(it);
                g.subtotal += it.price;
              });
              return Array.from(map.values());
            })();
        
        return (
          <Accordion 
            key={order._id}
            sx={{ 
              mb: 3, 
              borderLeft: hasEscrow ? '3px solid #1976d2' : 'none',
              borderRadius: '4px !important',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: hasEscrow ? 'rgba(25, 118, 210, 0.04)' : 'inherit',
                '&:hover': {
                  backgroundColor: hasEscrow ? 'rgba(25, 118, 210, 0.08)' : 'action.hover',
                },
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Order #{order._id?.slice(-6).toUpperCase() || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    {/* <Chip 
                      label={getStatusLabel(order.paymentStatus || order.status || 'pending')}
                      color={statusColor(order.paymentStatus || order.status || 'pending')}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        mr: 1
                      }}
                    /> */}
                    {hasEscrow && (
                      <Chip 
                        icon={<EscrowIcon fontSize="small" />}
                        label="Escrow"
                        color="info"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {hasEscrow && (
                <Box mb={3}>
                  <EscrowStatusCard 
                    order={order}
                    onReleaseFunds={() => handleReleaseEscrow(order._id)}
                    onRaiseDispute={() => handleRaiseDispute(order)}
                  />
                </Box>
              )}

              {sellerGroups.map((sg, idx) => (
                <Box key={idx} mb={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2">
                      Seller: {sg.seller?.name || sg.seller?.username || (typeof sg.seller === 'string' ? sg.seller.slice(-6) : 'Unknown')}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={`Status: ${getStatusLabel(sg.status || 'pending')}`}
                        color={statusColor(sg.status || 'pending')}
                        size="small"
                        variant="outlined"
                      />
                      {hasEscrow && (() => {
                        const sellerId = sg.seller?._id || sg.seller;
                        if (!sellerId) {
                          console.warn('Missing seller ID for order:', order._id);
                          return null;
                        }
                        
                        // Check if this seller's funds have been released
                        const sellerIdStr = sellerId.toString();
                        const isReleased = 
                          (order.escrowDetails?.releasedSellers || []).includes(sellerIdStr) || 
                          sg.escrowStatus === 'released' || 
                          sg.status === 'released';
                        
                        console.log('Seller funds status:', {
                          orderId: order._id,
                          sellerId: sellerIdStr,
                          isReleased,
                          releasedSellers: order.escrowDetails?.releasedSellers,
                          sgStatus: sg.status,
                          sgEscrowStatus: sg.escrowStatus
                        });
                        
                        return isReleased ? (
                          <Chip
                            label="Funds Released"
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 120 }}
                          />
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleReleaseEscrow(order._id, sellerIdStr)}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : null}
                            sx={{ minWidth: 180 }}
                          >
                            {loading ? 'Processing...' : 'Release Seller Funds'}
                          </Button>
                        );
                      })()}
                    </Box>
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(sg.items || []).map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>{item.product.name || 'Unknown Product'}</TableCell>
                            <TableCell align="right">Rs.{(item.price/item.quantity).toFixed(2)}</TableCell>
                            <TableCell align="right">{item.quantity || 1}</TableCell>
                            <TableCell align="right">Rs.{(item.price).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <strong>Subtotal:</strong>
                          </TableCell>
                          <TableCell align="right"><strong>Rs.{(sg.subtotal || 0).toFixed(2)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {typeof sg.deliveryCharge === 'number' && (
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Delivery charge: Rs.{Number(sg.deliveryCharge).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box mt={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress?.street}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                  {order.shippingAddress?.country}
                </Typography>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="subtitle1">Order Total</Typography>
                  <Typography variant="subtitle1" color="success.main">Rs.{Number(order.totalAmount || 0).toFixed(2)}</Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <RaiseDisputeDialog
        open={disputeDialogOpen}
        onClose={() => setDisputeDialogOpen(false)}
        onSubmit={handleSubmitDispute}
        loading={loading}
        error={error}
      />
    </Box>
  );
};

export default MyOrders;