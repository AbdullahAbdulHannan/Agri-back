import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery
} from '@mui/material';
import anar from '../assets/anar.jpg';
const LatestProducts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const products = [
    {
      name: 'Orange',
      price: 'Rs 250/Kg',
      image:'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop&crop=center',
      bgColor: '#e3f2fd'
    },
    {
      name: 'Pomegranate',
      price: 'Rs 800/Kg',
      image: anar,
      bgColor: '#fafafa'
    },
    {
      name: 'Strawberry',
      price: 'Rs 350/Kg',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop&crop=center',
      bgColor: '#f1f8e9'
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#fafafa' }}>
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
          Latest Mandi Products
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {products.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid #e8f5e8',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(76, 175, 80, 0.15)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{
                    backgroundColor: product.bgColor,
                    objectFit: 'cover'
                  }}
                />
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: '#000000',
                      mb: 1,
                      fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#4CAF50',
                      fontWeight: 700,
                      fontSize: { xs: '1rem', md: '1.25rem' }
                    }}
                  >
                    {product.price}
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

export default LatestProducts; 