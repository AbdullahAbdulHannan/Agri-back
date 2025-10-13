import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import {
  Favorite as FavoriteIcon
} from '@mui/icons-material';

const ProductCard = ({ product, originalProduct, onCardClick, onSave, onAddToCart }) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }
      }}
      onClick={onCardClick}
    >
      <Box
  sx={{
    width: '100%',
    height: 200,
    backgroundColor: product.bgColor || '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  }}
>
  <img
    src={product.image}
    alt={product.name}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    }}
  />
</Box>

      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
          {product.category || 'Text'}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {product.price}
        </Typography>
        
        {/* Product Name */}
        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, color: '#333' }}>
          {product.name}
        </Typography>
        
        {/* Stock Status */}
        {product.stock !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip 
              label={product.stock > 0 ? 'In Stock' : 'Out of Stock'} 
              size="small"
              color={product.stock > 0 ? 'success' : 'error'}
              variant="outlined"
            />
            {product.stock > 0 && (
              <Typography variant="caption" color="text.secondary">
                {product.stock} available
              </Typography>
            )}
          </Box>
        )}
        
        {/* View Details Button */}
        <Button
          variant="contained"
          fullWidth
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onCardClick();
          }}
          sx={{
            backgroundColor: '#4CAF50',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { 
              backgroundColor: '#45a049'
            }
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 