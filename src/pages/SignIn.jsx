import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon
} from '@mui/icons-material';
import authImage from '../assets/auth.jpg';
import { useAuth } from '../context';
import GoogleProfileSetupModal from '../components/GoogleProfileSetupModal';

const SignIn = () => {
  const navigate = useNavigate();
  const { login, googleSignIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      keepLoggedIn: event.target.checked
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setLoading(true);
      setError('');
      
      try {
        const result = await googleSignIn(response);
        
        // If this is a new Google user, show profile setup modal
        if (result.isNewGoogleUser) {
          setGoogleUserData(result.user);
          setShowProfileSetup(true);
          // Don't set loading to false here - keep loading until profile is complete
        } else {
          setLoading(false);
        navigate('/');
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  });

  const handleProfileSetupComplete = (updatedUser) => {
    setShowProfileSetup(false);
    setLoading(false);
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }} className='!mt-20'>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          minHeight: '80vh',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backgroundColor: 'white'
        }}>
          {/* Left Side - Sign In Form */}
          <Box sx={{ 
            flex: 1, 
            p: { xs: 3, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: '#000000',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Sign in
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: '#666666',
                  mb: 4,
                  fontSize: '1rem'
                }}
              >
                Please login to continue to your account.
              </Typography>
               
               <Alert severity="info" sx={{ mb: 3 }}>
                 <Typography variant="body2">
                   <strong>Note:</strong> If you signed up with Google, please use the "Sign in with Google" button below.
                 </Typography>
               </Alert>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={loading}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
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

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
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

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.keepLoggedIn}
                      onChange={handleCheckboxChange}
                      disabled={loading}
                      sx={{
                        color: '#4CAF50',
                        '&.Mui-checked': {
                          color: '#4CAF50',
                        },
                      }}
                    />
                  }
                  label="Keep me logged in"
                  sx={{ mb: 3, color: '#666666' }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    mb: 3,
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    or
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
                  onClick={googleLogin}
                  disabled={loading}
                  sx={{
                    borderColor: '#e0e0e0',
                    color: '#333333',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    mb: 3,
                    '&:hover': {
                      borderColor: '#4CAF50',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    },
                    '&:disabled': {
                      borderColor: '#ccc',
                      color: '#ccc',
                    },
                  }}
                >
                  Sign in with Google
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Need an account?{' '}
                    <Button
                      onClick={() => navigate('/signup')}
                      disabled={loading}
                      sx={{
                        color: '#1976d2',
                        textTransform: 'none',
                        p: 0,
                        minWidth: 'auto',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Create one
                    </Button>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Side - Image */}
          {!isMobile && (
            <Box sx={{ 
              flex: 1,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${authImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </Box>
          )}
        </Box>
      </Container>

      {/* Google Profile Setup Modal */}
      <GoogleProfileSetupModal
        open={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        googleUserData={googleUserData}
        onComplete={handleProfileSetupComplete}
      />
    </Box>
  );
};

export default SignIn; 