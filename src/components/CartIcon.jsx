import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Badge, IconButton } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const CartIcon = () => {
  const { summary } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <IconButton
      component={Link}
      to="/cart"
      sx={{
        color: 'gray.700',
        '&:hover': { color: 'green.600' },
        position: 'relative',
      }}
    >
      <Badge
        badgeContent={summary.itemCount > 99 ? '99+' : summary.itemCount}
        color="error"
        overlap="circular"
        invisible={summary.itemCount === 0}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.75rem',
            fontWeight: '600',
            minWidth: '20px',
            height: '20px',
          },
        }}
      >
        <ShoppingCartOutlinedIcon sx={{ fontSize: 24 }} />
      </Badge>
    </IconButton>
  );
};

export default CartIcon;
