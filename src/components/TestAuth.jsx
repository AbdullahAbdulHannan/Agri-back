import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useAuth } from '../context';
import { mockLogin, mockLogout } from '../utils/mockAuth';

const TestAuth = () => {
  const { isAuthenticated, user, userRole } = useAuth();

  const handleMockLogin = () => {
    mockLogin();
    window.location.reload(); // Reload to trigger auth check
  };

  const handleMockLogout = () => {
    mockLogout();
    window.location.reload(); // Reload to trigger auth check
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Authentication Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </Typography>
        {user && (
          <>
            <Typography variant="body2">
              User: {user.name}
            </Typography>
            <Typography variant="body2">
              Role: {userRole}
            </Typography>
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          onClick={handleMockLogin}
          sx={{ backgroundColor: '#4CAF50' }}
        >
          Mock Login as Seller
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleMockLogout}
          sx={{ borderColor: '#F44336', color: '#F44336' }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default TestAuth; 