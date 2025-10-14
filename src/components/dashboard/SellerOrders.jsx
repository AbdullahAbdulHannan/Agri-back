import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import {
  Box,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UpdateIcon from '@mui/icons-material/Update';
import HistoryIcon from '@mui/icons-material/History';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import Grid from '@mui/material/Grid';

const statusOptions = [
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancel Order' }
];

const statusFlow = {
  'pending': ['processing', 'cancelled'],
  'processing': ['shipped', 'cancelled'],
  'shipped': ['delivered', 'cancelled'],
  'delivered': [],
  'cancelled': []
};

const statusColor = (status) => {
  switch (status) {
    case 'pending':
      return { color: 'warning', label: 'Pending' };
    case 'processing':
      return { color: 'info', label: 'Processing' };
    case 'shipped':
      return { color: 'secondary', label: 'Shipped' };
    case 'delivered':
      return { color: 'success', label: 'Delivered' };
    case 'cancelled':
      return { color: 'error', label: 'Cancelled' };
    default:
      return { color: 'default', label: status };
  }
};

const StatusHistory = ({ history, open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Status History</DialogTitle>
    <DialogContent>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Changed By</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history?.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>
                <Chip 
                  label={statusColor(entry.status).label} 
                  color={statusColor(entry.status).color} 
                  size="small" 
                />
              </TableCell>
              <TableCell>{entry.changedBy?.name || 'System'}</TableCell>
              <TableCell>{new Date(entry.changedAt).toLocaleString()}</TableCell>
              <TableCell>{entry.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

const SellerOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusHistoryOpen, setStatusHistoryOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const { user } = useAuth();
  const theme = useTheme();

  // Initialize WebSocket connection
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(apiUrl);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      
      setNotification({
        open: true,
        message: `Order #${updatedOrder.orderNumber} has been updated to ${statusColor(updatedOrder.status).label}`,
        severity: 'info'
      });
    };

    socket.on('order_updated', handleOrderUpdate);
    return () => {
      socket.off('order_updated', handleOrderUpdate);
    };
  }, [socket]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderService.getSellerOrders();
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setNotification({
        open: true,
        message: 'Failed to load orders. Please refresh the page.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !selectedStatus) return;
    
    try {
      await orderService.updateSellerOrderStatus(selectedOrder._id, {
        status: selectedStatus,
        notes: notes
      });
      
      setNotification({
        open: true,
        message: 'Order status updated successfully',
        severity: 'success'
      });
      
      setStatusDialogOpen(false);
      setSelectedStatus('');
      setNotes('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to update order status',
        severity: 'error'
      });
    }
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setSelectedStatus('');
    setNotes('');
    setStatusDialogOpen(true);
  };

  const openStatusHistory = (order) => {
    setSelectedOrder(order);
    setStatusHistoryOpen(true);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!orders.length) {
    return (
      <Typography variant="h6" sx={{ mt: 4 }}>
        No orders yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Orders
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" color="textSecondary">
            You don't have any orders yet.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {orders.map((order) => {
            const orderStatus = statusColor(order.status);
            const canUpdateStatus = statusFlow[order.status]?.length > 0;
            
            return (
              <Box key={order._id} sx={{ mb: 4 }}>
                <Paper sx={{ mb: 2, overflow: 'hidden' }}>
                <Box 
                  p={2} 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  bgcolor="background.paper"
                  borderBottom={`1px solid ${theme.palette.divider}`}
                >
                  <Box>
                    <Typography variant="h6">
                      Order #{order._id}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label={orderStatus.label}
                      color={orderStatus.color}
                      variant="outlined"
                      size="medium"
                    />
                    
                    {canUpdateStatus && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UpdateIcon />}
                        onClick={() => openStatusDialog(order)}
                      >
                        Update Status
                      </Button>
                    )}
                  </Box>
                </Box>
                
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => {
                      const unitPrice = item.price / item.quantity;
                      return (
                        <TableRow key={item._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              {item.product?.images?.[0] && (
                                <Box 
                                  component="img"
                                  src={item.product.images[0]}
                                  alt={item.product.name || 'Product'}
                                  sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                                />
                              )}
                              <Box>
                                <Typography variant="body2">
                                  {item.product?.name || 'Product not found'}
                                </Typography>
                                {item.selectedTier !== undefined && (
                                  <Typography variant="caption" color="textSecondary">
                                    Tier: {item.selectedTier + 1}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box>Rs.{unitPrice.toFixed(2)}</Box>
                            <Box><small>per unit</small></Box>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            <Box>Rs.{item.price.toFixed(2)}</Box>
                            {item.deliveryCharge && (
                              <Box><small>+ Rs.{item.deliveryCharge} delivery</small></Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {/* Order Summary */}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Items Subtotal:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          Rs.{order.items.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}
                        </strong>
                      </TableCell>
                    </TableRow>
                    
                    {/* Shipping Charges */}
                    {order.sellerOrders?.map((sellerOrder, idx) => (
                      <TableRow key={`shipping-${idx}`}>
                        <TableCell colSpan={3} align="right">
                          <Box display="flex" justifyContent="flex-end" alignItems="center">
                            <strong>Shipping & Handling:</strong>
                            {sellerOrder.deliveryMethod && (
                              <Chip 
                                label={sellerOrder.deliveryMethod}
                                size="small"
                                sx={{ ml: 1 }}
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Rs.{(sellerOrder.deliveryCharge || 0).toFixed(2)}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1">Order Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" color="primary">
                          <strong>
                            Rs.{
                              (order.totalAmount || 
                              order.items.reduce((sum, item) => sum + (item.price || 0), 0) + 
                              (order.deliveryCharge || 0))
                              .toFixed(2)
                            }
                          </strong>
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </Paper>
                
                {/* Order Details Section */}
                <Box mt={2}>
                <Accordion defaultExpanded>
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.03)' }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocalShippingIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Order & Delivery Details
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* Shipping Address */}
                      <Grid item xs={12} md={6}>
                        {order?.shippingAddress || order?.user?.shippingAddress ? (
                          <Box>
                            {order.shippingAddress?.street && (
                              <Typography>{order.shippingAddress.street}</Typography>
                            )}
                            {(order.shippingAddress?.city || order.shippingAddress?.state) && (
                              <Typography>
                                {order.shippingAddress.city}{order.shippingAddress.city && order.shippingAddress.state ? ', ' : ''}
                                {order.shippingAddress.state}
                              </Typography>
                            )}
                            {(order.shippingAddress?.postalCode || order.shippingAddress?.country) && (
                              <Typography>
                                {order.shippingAddress.postalCode}{order.shippingAddress.postalCode && order.shippingAddress.country ? ', ' : ''}
                                {order.shippingAddress.country}
                              </Typography>
                            )}
                            {order.shippingAddress?.landmark && (
                              <Typography color="textSecondary">
                                Landmark: {order.shippingAddress.landmark}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography color="textSecondary">No shipping address provided</Typography>
                        )}
                      </Grid>
                      
                      {/* Contact Information */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Contact Information
                        </Typography>
                        {order?.contactInfo || order?.user?.email ? (
                          <Box>
                            <Typography>{order.contactInfo?.name || 'Customer'}</Typography>
                            {order.contactInfo?.phone && (
                              <Typography>Phone: {order.contactInfo.phone}</Typography>
                            )}
                            {(order.contactInfo?.email || order.user?.email) && (
                              <Typography>Email: {order.contactInfo?.email || order.user.email}</Typography>
                            )}
                            {order.contactInfo?.additionalInfo && (
                              <Box mt={1}>
                                <Typography variant="caption" color="textSecondary">
                                  Additional Info:
                                </Typography>
                                <Typography variant="body2">
                                  {order.contactInfo.additionalInfo}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Typography color="textSecondary">No contact information available</Typography>
                        )}
                      </Grid>
                      
                      {/* Order Timeline */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Order Timeline
                        </Typography>
                        <Box>
                          <Typography>
                            <strong>Order Placed:</strong>{' '}
                            {new Date(order.createdAt).toLocaleString()}
                          </Typography>
                          {order.estimatedDeliveryDate && (
                            <Typography>
                              <strong>Estimated Delivery:</strong>{' '}
                              {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                </Box>
              </Box>
            );
          })}
          
          {/* Status Update Dialog */}
          <Dialog 
            open={statusDialogOpen} 
            onClose={() => setStatusDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogContent>
              <Box mt={2}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    label="New Status"
                  >
                    {selectedOrder?.status && statusFlow[selectedOrder.status]?.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box mt={2}>
                  <TextField
                    label="Notes (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this status update..."
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleStatusUpdate}
                variant="contained"
                color="primary"
                disabled={!selectedStatus}
              >
                Update Status
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Status History Dialog */}
          {selectedOrder && (
            <StatusHistory
              open={statusHistoryOpen}
              onClose={() => setStatusHistoryOpen(false)}
              history={selectedOrder.statusHistory || []}
            />
          )}
          
          {/* Notification Snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseNotification} 
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </Box>
  );
};

export default SellerOrders;