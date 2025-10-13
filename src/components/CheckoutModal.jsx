import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Typography, Box, Stepper, Step, StepLabel, Divider,
  Alert, CircularProgress, Grid, Card, CardContent, styled, useTheme
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

const StyledCardElement = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(2, 0),
  '& .StripeElement': {
    padding: '10px',
  },
}));

const formatCurrency = (amount, currency = 'PKR') => {
  return new Intl.NumberFormat(currency === 'PKR' ? 'en-PK' : 'en-US', {
    style: 'currency',
    currency: currency || 'PKR',
    minimumFractionDigits: currency === 'PKR' ? 0 : 2,
  }).format(amount);
};

let stripePromise;
if (typeof window !== 'undefined') {
  try {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (stripeKey) {
      stripePromise = loadStripe(stripeKey);
    } else {
      // console.error('Stripe publishable key is missing.');
    }
  } catch (error) {
    // console.error('Failed to initialize Stripe:', error);
  }
}

const steps = ['Shipping Information', 'Payment Details', 'Order Confirmation'];

const CheckoutForm = ({ onSuccess, onError, orderData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const theme = useTheme();

  const handleChange = (event) => {
    setError(event.error ? event.error.message : '');
    setCardComplete(event.complete);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setProcessing(true);

    if (!stripe || !elements) {
      setError('Payment service is not available. Please try again later.');
      setProcessing(false);
      return;
    }

    try {
      if (!orderData) throw new Error('Order information is missing.');
      const paymentIntentsList = orderData?.order?.paymentIntents || [];
      if (!paymentIntentsList.length) throw new Error('Payment information is not ready.');

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card details are not complete.');

      // 1. Create payment method first
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: orderData.order.contactInfo?.name || 'Customer',
          email: orderData.order.contactInfo?.email,
          phone: orderData.order.contactInfo?.phone,
          address: {
            line1: orderData.order.shippingAddress?.street,
            city: orderData.order.shippingAddress?.city,
            state: orderData.order.shippingAddress?.state,
            postal_code: orderData.order.shippingAddress?.postalCode,
            country: orderData.order.shippingAddress?.country || 'PK'
          }
        }
      });

      if (paymentMethodError || !paymentMethod) {
        throw new Error(paymentMethodError?.message || 'Could not process card details');
      }

      // 2. Process each payment intent
      const confirmedIntents = [];
      
      for (const intentInfo of paymentIntentsList) {
        const clientSecret = intentInfo.clientSecret || intentInfo.client_secret;
        if (!clientSecret) throw new Error('Missing client secret for a payment segment.');

        // Confirm the payment intent with the payment method
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: paymentMethod.id,
            receipt_email: orderData.order.contactInfo?.email,
            setup_future_usage: 'off_session',
            save_payment_method: true
          }
        );

        if (confirmError) {
          throw new Error(confirmError.message || 'Payment confirmation failed');
        }

        if (!paymentIntent) {
          throw new Error('Payment was not successful. Please try again.');
        }

        // Check if the payment requires additional action (3D Secure)
        if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
          // Let Stripe.js handle the required actions
          const { error: actionError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
            clientSecret
          );

          if (actionError) {
            throw new Error(actionError.message || '3D Secure authentication failed');
          }

          confirmedIntents.push(confirmedIntent);
        } else {
          confirmedIntents.push(paymentIntent);
        }
      }

      // Verify all payments were successful
      const failedPayment = confirmedIntents.find(intent => intent.status !== 'succeeded');
      if (failedPayment) {
        throw new Error(`Payment failed with status: ${failedPayment.status}`);
      }

      // Call the success handler with the first payment intent
      onSuccess && onSuccess({ 
        status: 'succeeded',
        paymentIntent: confirmedIntents[0] 
      });
      
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Payment Information</Typography>
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Card Details</Typography>
          {error && (<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>)}
          <Box sx={{ p: 3, border: '2px dashed', borderColor: 'primary.main', borderRadius: 2, mb: 2, backgroundColor: theme.palette.background.paper }}>
            <Box sx={{ width: '100%', maxWidth: '500px' }}>
              <CardElement options={{ hidePostalCode: true }} onChange={handleChange} />
            </Box>
          </Box>
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={!stripe || !orderData || !cardComplete} sx={{ mt: 2 }}>
          Pay {orderData ? formatCurrency(orderData.order.totalAmount, orderData.order.currency) : ''}
        </Button>
      </Box>
    </form>
  );
};

const CheckoutModal = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { items, summary, clearCart, loadCartSummary } = useCart();
  const { user } = useAuth();

  const [shippingData, setShippingData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  
  // Load cart summary with coordinates when address changes
  const updateCartSummaryWithAddress = async (address) => {
    try {
      if (!address) {
        // console.warn('No address provided, loading cart summary without coordinates');
        return await loadCartSummary();
      }

      // First try to use coordinates directly from the address
      if (address.latitude != null && address.longitude != null) {
        // console.log('Using stored coordinates from address:', { 
        //   lat: address.latitude, 
        //   lng: address.longitude 
        // });
        return await loadCartSummary(address.latitude, address.longitude);
      }

      // If no coordinates, try to geocode the address
      // console.log('No stored coordinates, attempting to geocode address');
      const full = `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
      // console.log('Geocoding address:', full);
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(full)}`);
        const data = await response.json();
        
        if (data && data[0]) {
          const { lat, lon } = data[0];
          // console.log('Geocoding successful, using coordinates:', { lat, lon });
          return await loadCartSummary(parseFloat(lat), parseFloat(lon));
        } else {
          // console.warn('No coordinates found from geocoding');
        }
      } catch (geocodeError) {
        // console.error('Geocoding failed:', geocodeError);
      }
      
      // Fallback to loading without coordinates if geocoding fails
      // console.warn('Falling back to loading cart summary without coordinates');
      await loadCartSummary();
    } catch (error) {
      // console.error('Error updating cart summary with address:', error);
      // Fallback to loading without coordinates
      try {
        await loadCartSummary();
      } catch (loadError) {
        // console.error('Failed to load cart summary:', loadError);
      }
    }
  };
  const [useSaved, setUseSaved] = useState((user?.addresses || []).length > 0);
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const def = (user?.addresses || []).find(a => a.isDefault) || (user?.addresses || [])[0];
    return def?._id || '';
  });

  useEffect(() => {
    const initCart = async () => {
      const addrs = user?.addresses || [];
      if (addrs.length > 0) {
        const def = addrs.find(a => a.isDefault) || addrs[0];
        if (def) {
          setSelectedAddressId(def._id);
          setShippingData(prev => ({
            ...prev,
            name: def.name || prev.name,
            phone: def.phone || prev.phone,
            email: def.email || prev.email,
            street: def.street || prev.street,
            city: def.city || prev.city,
            state: def.state || prev.state,
            postalCode: def.postalCode || prev.postalCode,
            country: def.country || prev.country
          }));
          
          // Update cart summary with the selected address
          await updateCartSummaryWithAddress(def);
        } else if (loadCartSummary) {
          // No default address, load without coordinates
          await loadCartSummary();
        }
      } else if (loadCartSummary) {
        // No addresses, load without coordinates
        await loadCartSummary();
      }
    };

    initCart();
  }, [user, loadCartSummary]);

  const handleShippingSubmit = async () => {
    if (!useSaved && (!shippingData.street || !shippingData.city || !shippingData.state || !shippingData.postalCode)) {
      setError('Please fill in all required shipping information');
      return;
    }
    if (!stripePromise) {
      setError('Payment service is not available. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Payment service failed to initialize. Please try again.');

      let shippingAddress;
      if (useSaved && selectedAddressId) {
        const addr = (user?.addresses || []).find(a => a._id === selectedAddressId);
        shippingAddress = addr ? {
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country || 'Pakistan'
        } : {
          street: shippingData.street,
          city: shippingData.city,
          state: shippingData.state,
          postalCode: shippingData.postalCode,
          country: shippingData.country || 'Pakistan'
        };
      } else {
        shippingAddress = {
          street: shippingData.street,
          city: shippingData.city,
          state: shippingData.state,
          postalCode: shippingData.postalCode,
          country: shippingData.country || 'Pakistan'
        };
      }

      const payload = {
        shippingAddress,
        contactInfo: {
          name: shippingData.name || 'Customer',
          phone: shippingData.phone || '',
          email: shippingData.email || ''
        },
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          tier: item.selectedTier,
          price: item.product.price[item.selectedTier]?.price
        })),
        location: null
      };

      const response = await orderService.createEscrowOrder(payload);
      const responseData = response.data || response;
      if (!responseData?.order?._id) throw new Error('Order could not be created');
      if (!responseData.order?.paymentIntents?.length) throw new Error('Payment could not be initialized.');

      setOrderData(responseData);
      setActiveStep(1);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setActiveStep(2);
    clearCart();
    onSuccess && onSuccess({ status: 'succeeded' });
  };

  const handleClose = () => {
    setActiveStep(0);
    setOrderData(null);
    setError(null);
    onClose();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Shipping Information</Typography>
            <Grid container spacing={2}>
              {(user?.addresses || []).length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Use Saved Address?</Typography>
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                      <Button variant={useSaved ? 'contained' : 'outlined'} size="small" onClick={() => setUseSaved(true)}>Saved</Button>
                      <Button variant={!useSaved ? 'contained' : 'outlined'} size="small" onClick={() => setUseSaved(false)}>New</Button>
                      {useSaved && (
                        <select 
                          value={selectedAddressId} 
                          onChange={async (e) => {
                            const addrId = e.target.value;
                            setSelectedAddressId(addrId);
                            const addr = user.addresses.find(a => a._id === addrId);
                            if (addr) {
                              await updateCartSummaryWithAddress(addr);
                            }
                          }} 
                          style={{ padding: 8, borderRadius: 6, borderColor: '#ddd' }}
                        >
                          {(user.addresses || []).map(a => (
                            <option value={a._id} key={a._id}>{(a.label || 'Address') + ' - ' + [a.street, a.city, a.state].filter(Boolean).join(', ')}</option>
                          ))}
                        </select>
                      )}
                    </Box>
                    {useSaved && selectedAddressId && (() => {
                      const a = (user.addresses || []).find(x => x._id === selectedAddressId);
                      if (!a) return null;
                      return (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {a.street}<br/>{a.city}, {a.state} {a.postalCode}<br/>{a.country}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Box>
                </Grid>
              )}
              {!useSaved && (
                <>
                <Grid item xs={12}>
                  <TextField fullWidth label="Full Name" value={shippingData.name} onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Street Address" value={shippingData.street} onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="City" value={shippingData.city} onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="State" value={shippingData.state} onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Postal Code" value={shippingData.postalCode} onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" value={shippingData.phone} onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })} required />
                </Grid>
                </>
              )}
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Payment Details</Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Order Summary</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Shipping To</Typography>
                  {(() => {
                    let a;
                    if (useSaved && selectedAddressId) a = (user?.addresses || []).find(x => x._id === selectedAddressId);
                    return (
                      <Typography variant="body2" color="text.secondary">
                        {a ? (
                          <>
                            {a.street}<br/>{a.city}, {a.state} {a.postalCode}<br/>{a.country}
                          </>
                        ) : (
                          <>
                            {shippingData.street}<br/>{shippingData.city}, {shippingData.state} {shippingData.postalCode}<br/>{shippingData.country}
                          </>
                        )}
                      </Typography>
                    );
                  })()}
                </Box>
                {items.map((item) => (
                  <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{item.product.name} x {item.quantity}</Typography>
                    <Typography variant="body2">Rs.{(item.product.price[item.selectedTier]?.price * item.quantity).toFixed(2)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="textSecondary">Delivery</Typography>
                  <Typography color="textSecondary">
                    {(() => {
                      if (orderData?.order?.sellerOrders?.length) {
                        const dc = orderData.order.sellerOrders.reduce((sum, so) => sum + (Number(so.deliveryCharge) || 0), 0);
                        return `Rs.${dc.toFixed(2)}`;
                      }
                      if (summary?.deliveryCharges != null) return `Rs.${Number(summary.deliveryCharges).toFixed(2)}`;
                      return '—';
                    })()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="success.main">
                    {(() => {
                      if (orderData?.order?.totalAmount != null) return `Rs.${Number(orderData.order.totalAmount).toFixed(2)}`;
                      const g = summary?.grandTotal != null ? Number(summary.grandTotal) : Number(summary?.totalPrice || 0);
                      return `Rs.${g.toFixed(2)}`;
                    })()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            {orderData ? (
              <CheckoutForm orderData={orderData} onSuccess={handlePaymentSuccess} onError={setError} />
            ) : (
              <Alert severity="error">Order data is missing. Please go back and try again.</Alert>
            )}
          </Box>
        );
      case 2:
        return (
          <Box textAlign="center">
            <Typography variant="h5" color="success.main" gutterBottom>Payment Successful!</Typography>
            <Typography variant="body1" gutterBottom>Your order has been confirmed and is being processed.</Typography>
            <Typography variant="body2" color="text.secondary">Order ID: {orderData?.order?._id}</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Checkout</Typography>
          <Button onClick={handleClose} color="inherit">×</Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : (
          <Elements stripe={stripePromise}>
            {renderStepContent(activeStep)}
          </Elements>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep < 2 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            {activeStep === 0 && (
              <Button onClick={handleShippingSubmit} variant="contained" color="success" disabled={loading}>Continue to Payment</Button>
            )}
          </>
        )}
        {activeStep === 2 && (
          <Button onClick={handleClose} variant="contained" color="success">Done</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutModal;