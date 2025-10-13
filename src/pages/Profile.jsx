import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Grid,
  Container,
  useTheme,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { API_BASE_URL } from '../main';
import authBg from '../assets/auth.jpg';

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    addressLine2: '',
    area: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan'
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Here you would typically save the changes to your backend
      // For now, we'll just update the local user data
      const updatedUser = { ...user, ...formData };
      updateUser(updatedUser);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.user?.addresses || []);
          updateUser({ ...user, ...data.user });
        }
      } catch (e) { }
    };
    if (isAuthenticated) fetchMe();
  }, [isAuthenticated]);

  const saveAddress = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ address: newAddress })
      });
      if (!res.ok) throw new Error('Failed to save address');
      const data = await res.json();
      setAddresses(data.addresses || []);
      updateUser({ ...user, addresses: data.addresses || [] });
      setNewAddress({ label: '', street: '', addressLine2: '', area: '', city: '', state: '', postalCode: '', country: 'Pakistan' });
      setSuccess('Address saved');
    } catch (e) {
      setError(e.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (addressId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ setDefaultAddressId: addressId })
      });
      if (!res.ok) throw new Error('Failed to set default address');
      const data = await res.json();
      setAddresses(data.user?.addresses || []);
      updateUser({ ...user, ...data.user });
      setSuccess('Default address updated');
    } catch (e) {
      setError(e.message || 'Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '80%', padding: 2, margin: 'auto', marginTop: 10, backgroundColor: 'white', borderRadius: 10 }}>
      {/* Left Section - Profile Form */}
      <Box sx={{
        flex: 1,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        overflowY: 'auto',
        borderRadius: 10
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ color: '#666' }}
          >
            Back
          </Button>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            variant="outlined"
            color="error"
            sx={{ borderRadius: '20px' }}
          >
            Logout
          </Button>
        </Box>

        {/* Profile Picture Section */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: 4,
          position: 'relative'
        }}>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
              {formData.name || 'Your Name'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666' }}>
              {formData.email || 'your.email@example.com'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
              Role: {user?.role || 'User'}
            </Typography>
          </Box>
        </Box>

        {/* Messages */}
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

        {/* Form Fields */}
        <Grid container spacing={3} sx={{ maxWidth: 600 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing || loading}
              placeholder="Your name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing || loading}
              placeholder="your.email@example.com"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing || loading}
              placeholder="Add phone number"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                  },
                },
              }}
            />
          </Grid>

        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Addresses */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Addresses</Typography>
          {(addresses || []).map((addr) => (
            <Box key={addr._id || addr.street} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2">{addr.label || 'Address'} {addr.isDefault ? '(Default)' : ''}</Typography>
                <Typography variant="body2" color="text.secondary">{addr.street}</Typography>
                <Typography variant="body2" color="text.secondary">{addr.city}, {addr.state} {addr.postalCode}</Typography>
                <Typography variant="body2" color="text.secondary">{addr.country}</Typography>
              </Box>
              {!addr.isDefault && (
                <Button variant="outlined" size="small" onClick={() => setDefaultAddress(addr._id)} disabled={loading}>
                  Set Default
                </Button>
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Add New Address</Typography>
          <Grid container spacing={2} sx={{ maxWidth: 600 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Label (e.g., Home, Office)" value={newAddress.label} onChange={(e) => setNewAddress(a => ({ ...a, label: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Street" value={newAddress.street} onChange={(e) => setNewAddress(a => ({ ...a, street: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address Line 2" value={newAddress.addressLine2} onChange={(e) => setNewAddress(a => ({ ...a, addressLine2: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Area" value={newAddress.area} onChange={(e) => setNewAddress(a => ({ ...a, area: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" value={newAddress.city} onChange={(e) => setNewAddress(a => ({ ...a, city: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="State" value={newAddress.state} onChange={(e) => setNewAddress(a => ({ ...a, state: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress(a => ({ ...a, postalCode: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Country" value={newAddress.country} onChange={(e) => setNewAddress(a => ({ ...a, country: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="success" onClick={saveAddress} disabled={loading || !newAddress.street || !newAddress.city || !newAddress.state}>
                Save Address
              </Button>
            </Grid>
          </Grid>
        </Box>
      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Box sx={{ mt: 4, maxWidth: 600 }}>
        {isEditing ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  location: user?.location || ''
                });
                setError('');
                setSuccess('');
              }}
              disabled={loading}
              sx={{
                borderColor: '#666',
                color: '#666',
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                flex: 1,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveChanges}
              disabled={loading}
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                flex: 1,
                '&:hover': { backgroundColor: '#1565c0' },
                '&:disabled': { backgroundColor: '#ccc' },
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
          </Box>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setIsEditing(true)}
            sx={{
              borderColor: '#4CAF50',
              color: '#4CAF50',
              py: 1.5,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                borderColor: '#45a049',
                backgroundColor: '#4CAF5010',
              },
            }}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Box>

      {/* Right Section - Background Image */ }
  <Box sx={{
    flex: 1,
    position: 'relative',
    display: { xs: 'none', lg: 'block' }
  }}>
    <img
      src={authBg}
      alt="Background"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  </Box>
    </Box >
  );
};

export default Profile; 