import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Alert
} from '@mui/material';
import { useAuth } from '../context';
import { API_BASE_URL } from '../main';

const GoogleProfileSetupModal = ({ open, onClose, googleUserData, onComplete }) => {
  const [formData, setFormData] = useState({
    username: googleUserData?.username || '',
    phone: '',
    role: 'buyer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Update the user data with additional information
      const updatedUserData = {
        ...googleUserData,
        username: formData.username,
        phone: formData.phone,
        role: formData.role
      };

      // Call the backend to update user profile
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: formData.username,
          phone: formData.phone,
          role: formData.role
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update local user data
      updateUser(updatedUser.user);
      
      onComplete(updatedUser.user);
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to update profile');
      console.log( error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => {}} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={googleUserData?.profilePicture} alt={googleUserData?.name} />
          <Box>
            <Typography variant="h6">Complete Your Profile</Typography>
            <Typography variant="body2" color="textSecondary">
              Welcome, {googleUserData?.name}! Please provide some additional information.
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={handleChange('username')}
            margin="normal"
            required
            helperText="Choose a unique username for your account"
          />

          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange('phone')}
            margin="normal"
            type="tel"
            helperText="Your phone number (optional)"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={formData.role}
              onChange={handleChange('role')}
              label="Account Type"
            >
              <MenuItem value="buyer">Buyer</MenuItem>
              <MenuItem value="seller">Seller</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Account Information:</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email: {googleUserData?.email}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Name: {googleUserData?.name}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.username}
          sx={{ 
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#45a049' }
          }}
        >
          {loading ? 'Saving...' : 'Complete Setup'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoogleProfileSetupModal;
