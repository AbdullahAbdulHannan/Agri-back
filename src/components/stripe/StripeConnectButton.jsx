import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, CircularProgress, Box, Typography, Paper } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import axios from 'axios';

export default function StripeConnectButton({ onConnect }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [accountDetails, setAccountDetails] = useState(null);

  useEffect(() => {
    // Check for success/failure in URL params after Stripe redirect
    const params = new URLSearchParams(window.location.search);
    const stripeSuccess = params.get('stripe_success');
    const stripeRefresh = params.get('stripe_refresh');
    
    if (stripeSuccess || stripeRefresh) {
      // Clean up the URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Show appropriate message
      if (stripeSuccess) {
        toast.success('Stripe account connected successfully!');
      } else if (stripeRefresh) {
        toast.info('Please complete all required fields in Stripe to activate your account');
      }
      
      // Refresh account status
      checkAccountStatus();
    } else {
      // Regular status check
      checkAccountStatus();
    }
  }, []);

  const checkAccountStatus = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/stripe/account/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (data.connected) {
        setStatus(data.status);
        setAccountDetails(data.account);
        if (onConnect) onConnect(data.status === 'active');
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      toast.error('Error checking Stripe account status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      console.log('Initiating Stripe connection...');
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = 'http://localhost:5000/api/stripe/connect';
      console.log(`Making request to ${endpoint}...`);
      const response = await axios({
        method: 'get',
        url: endpoint,
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        responseType: 'json',
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('Response received:', response);
      
      if (response.data && response.data.url) {
        console.log('Redirecting to Stripe:', response.data.url);
        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          window.location.href = response.data.url;
        }, 100);
      } else {
        throw new Error('No URL received from server');
      }
    } catch (error) {
      console.error('Error in handleConnect:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to connect to Stripe. Please try again.';
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (loading) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <Typography>Checking status...</Typography>
        </Box>
      );
    }

    if (status === 'active') {
      return (
        <Box display="flex" alignItems="center" gap={1} color="success.main">
          <CheckCircle />
          <Typography>Connected to Stripe</Typography>
        </Box>
      );
    }

    if (status === 'pending') {
      return (
        <Box display="flex" alignItems="center" gap={1} color="warning.main">
          <CircularProgress size={20} />
          <Typography>Verification in progress...</Typography>
        </Box>
      );
    }

    return (
      <Button
        variant="contained"
        color="primary"
        onClick={handleConnect}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Connecting...' : 'Connect with Stripe'}
      </Button>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Payment Account
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Connect your Stripe account to receive payments. You'll be redirected to Stripe to complete the setup.
      </Typography>
      
      <Box mt={2}>
        {renderStatus()}
      </Box>

      {accountDetails && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>Account Details:</Typography>
          <Box component="dl" sx={{ '& dt': { fontWeight: 'bold', display: 'inline' }, '& dd': { display: 'inline', ml: 1 } }}>
            <Box mb={1}>
              <dt>Status:</dt>
              <dd>{accountDetails.charges_enabled ? 'Active' : 'Pending'}</dd>
            </Box>
            {accountDetails.email && (
              <Box mb={1}>
                <dt>Email:</dt>
                <dd>{accountDetails.email}</dd>
              </Box>
            )}
            {accountDetails.requirements && accountDetails.requirements.disabled_reason && (
              <Box mb={1} color="error.main">
                <ErrorIcon fontSize="small" />
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  {accountDetails.requirements.disabled_reason}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
