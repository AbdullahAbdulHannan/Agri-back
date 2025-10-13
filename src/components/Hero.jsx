import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import heroImage from '../assets/hero.jpg';


const Hero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              zIndex: 1
            }
          }}
        />

        {/* Content */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 2,
            mt: 8, // Account for fixed header
            textAlign: 'center'
          }}
        >
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            sx={{
              color: '#000000',
              mb: 3,
              lineHeight: 1.5,
              textShadow: 'none',
              fontSize: isMobile ? '1.5rem' : '2.5rem'
            }}
            className='!font-bold'
          >
            Connecting Farmers & Buyer Through Smart
            <br />
            Agriculture
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: '#000000',
              mb: 5,
              fontWeight:500,
              lineHeight: 1.6,
              textShadow: 'none',
              fontSize: isMobile ? '0.95rem' : '1rem',
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            AgriBazaar simplifies agricultural trade, making it efficient, transparent, and profitable for everyone.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                borderRadius: '13px',
                '&:hover': {
                  backgroundColor: '#45a049',
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                }
              }}
            >
              Let's Start
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: '#4CAF50',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderWidth: '2px',
                backgroundColor: 'white',
                borderColor: 'white',
                '&:hover': {
                  color: 'white',
                  borderColor: 'white',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderWidth: '2px',
                }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

    
    </>
  );
};

export default Hero; 