import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import AddProductModal from '../AddProductModal';
import { useAuth } from '../../context/AuthContext';
import EditProductModal from '../EditProductModal';
import { productService } from '../../services/productService';

const DashboardMarketplace = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        alert('Product deleted successfully!');
        // Refresh the product list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(error.message || 'Failed to delete product');
      }
    }
  };

  const handleUpdate = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handlePostAd = () => {
    setModalOpen(true);
  };

  const handleProductAdded = (productData) => {
    console.log('New product added:', productData);
    alert('Product added successfully!');
    // Refresh the product list
    fetchProducts();
  };

  const handleProductUpdated = (productData) => {
    console.log('Product updated:', productData);
    alert('Product updated successfully!');
    // Refresh the product list
    fetchProducts();
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    if (!user) {
      setProducts([]);
      return;
    }
    try {
      setLoading(true);
      const data = await productService.getProducts({ type: 'marketplace', seller: user.id || user._id });
      setProducts(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Market Place
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            displayEmpty
            sx={{ 
              '& .MuiSelect-select': { 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      {/* Search and Post Ad Section */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              },
            }
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handlePostAd}
          sx={{
            backgroundColor: '#4CAF50',
            color: 'white',
            px: 2.5,
            py: 1,
            borderRadius: '50px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: '#45a049' },
          }}
        >
          Post Ad
        </Button>
      </Box>

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card sx={{ 
                height: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                      {product.name}
                    </Typography>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#4CAF5015',
                        color: '#4CAF50',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Rs. {product.price && product.price.length > 0 ? product.price[0].price : 0}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(product._id)}
                      sx={{
                        flex: 1,
                        borderColor: '#F44336',
                        color: '#F44336',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#D32F2F',
                          backgroundColor: '#F4433610',
                        }
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdate(product)}
                      sx={{
                        flex: 1,
                        borderColor: '#4CAF50',
                        color: '#4CAF50',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#45a049',
                          backgroundColor: '#4CAF5010',
                        }
                      }}
                    >
                      Update
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State (when no products) */}
      {!loading && products.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: '#f8f9fa',
          borderRadius: 2
        }}>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
            No products found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Start by posting your first ad to showcase your products
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handlePostAd}
            sx={{
              backgroundColor: '#4CAF50',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
              '&:hover': { backgroundColor: '#45a049' },
            }}
          >
            Post Your First Ad
          </Button>
        </Box>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onProductAdded={handleProductAdded}
        productType="marketplace"
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
    </Box>
  );
};

export default DashboardMarketplace; 