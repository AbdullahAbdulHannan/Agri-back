import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import clockImage from '../assets/clock.png';
import leavesImage from '../assets/leaves.png';
import marketImage from '../assets/market.png';

const CoreModules = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const modules = [
    {
      icon: clockImage,
      title: 'Order Manage',
      description: 'Manage your orders, track shipments, and streamline your order processing with ease.'
    },
    {
      icon: leavesImage,
      title: 'E-Mandi',
      description: 'Discover a wide range of fresh produce directly from farmers, ensuring quality and fair prices.'
    },
    {
      icon: marketImage,
      title: 'Marketplace',
      description: 'Explore a diverse marketplace for agricultural products, equipment, and services.'
    }
  ];

  return (
    <Box id='core-modules' sx={{ py: 8, backgroundColor: '#ffffff' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          sx={{
            textAlign: 'center',
            color: '#4CAF50',
            fontWeight: 700,
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Our Core Modules
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {modules.map((module, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid #e8f5e8',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(76, 175, 80, 0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={module.icon} 
                      alt={module.title}
                      style={{ 
                        width: '64px', 
                        height: '64px',
                        objectFit: 'contain'
                      }} 
                    />
                  </Box>
                  
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: '#000000',
                      mb: 2,
                      fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {module.title}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666666',
                      lineHeight: 1.6,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    {module.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CoreModules; 