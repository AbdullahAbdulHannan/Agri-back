import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon
} from '@mui/icons-material';
import authImage from '../assets/auth.jpg';
import axios from 'axios';
import { API_BASE_URL } from '../main';
const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('buyer');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    phone: '',
    password: '',
    street: '',
    addressLine2: '',
    area: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan'
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleUserTypeChange = (event, newUserType) => {
    if (newUserType !== null) {
      setUserType(newUserType);
    }
  };

  const handleSubmit = (event) => {
    const address = formData.street || formData.city || formData.state || formData.postalCode
      ? {
          street: formData.street,
          addressLine2: formData.addressLine2,
          area: formData.area,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country || 'Pakistan'
        }
      : undefined;

    axios.post(`${API_BASE_URL}/api/auth/signup`, {
      email: formData.email,
      name: formData.name,
      username: formData.username,
      phone: formData.phone,
      password: formData.password,
      role: userType,
      address
    })
    .then(res=>{
      alert('Sign up successful!');
      navigate('/signin');
    })
    .catch(err => {
      alert('Sign up failed: ' + (err.response ? err.response.data.message : err.message));
    });
    event.preventDefault();
    console.log('Sign up:', { ...formData, userType });
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
          {/* Left Side - Sign Up Form */}
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
                Sign up
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: '#666666',
                  mb: 4,
                  fontSize: '1rem'
                }}
              >
                Please Signup to continue to your account.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
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
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
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
                  label="Username"
                  value={formData.username}
                  onChange={handleChange('username')}
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
                  label="Number"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
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

                {/* Address */}
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Optional Address (for delivery)
                  </Typography>
                </Divider>

                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.street}
                  onChange={handleChange('street')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={formData.addressLine2}
                  onChange={handleChange('addressLine2')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Area"
                  value={formData.area}
                  onChange={handleChange('area')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={handleChange('city')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={handleChange('state')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={handleChange('postalCode')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={handleChange('country')}
                  sx={{ mb: 2 }}
                />

                {/* User Type Selection */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#666666' }}>
                    I am a:
                  </Typography>
                  <ToggleButtonGroup
                    value={userType}
                    exclusive
                    onChange={handleUserTypeChange}
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderColor: '#e0e0e0',
                        color: '#666666',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&.Mui-selected': {
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#45a049',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="buyer">
                      Buyer
                    </ToggleButton>
                    <ToggleButton value="seller">
                      Seller
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
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
                  }}
                >
                  Sign up
                </Button>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Already Have an account?{' '}
                    <Button
                      onClick={() => navigate('/signin')}
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
                      Login
                    </Button>
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    or
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{
                    borderColor: '#e0e0e0',
                    color: '#333333',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    '&:hover': {
                      borderColor: '#4CAF50',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    },
                  }}
                >
                  Sign in with Google
                </Button>
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
    </Box>
  );
};

export default SignUp; 