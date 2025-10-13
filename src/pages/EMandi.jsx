import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
  Typography,
  CircularProgress
} from '@mui/material';
import FilterSidebar from '../components/FilterSidebar';
import SearchAndSort from '../components/SearchAndSort';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';

const EMandi = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters and search
  const [searchValue, setSearchValue] = useState('');
  const [selectedSort, setSelectedSort] = useState('new');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Sort options data
  const sortOptions = [
    { label: 'New', value: 'new' },
    { label: 'Price ascending', value: 'price_asc' },
    { label: 'Price descending', value: 'price_desc' },
    { label: 'Rating', value: 'rating' }
  ];

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductsByType('emandi');
      setProducts(data);
      applyFiltersAndSort(data, priceRange, selectedSort);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sort to products
  const applyFiltersAndSort = (productsToFilter, currentPriceRange, currentSort) => {
    let filtered = [...productsToFilter];
    
    // Apply price range filter only if user has interacted with it
    if (isPriceFilterActive) {
      filtered = filtered.filter(product => {
        const price = product.price[0]?.price || 0;
        return price >= currentPriceRange[0] && price <= currentPriceRange[1];
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const priceA = a.price[0]?.price || 0;
      const priceB = b.price[0]?.price || 0;
      
      switch(currentSort) {
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'new':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    setFilteredProducts(filtered);
  };

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters/sort when they change
  useEffect(() => {
    if (products.length > 0) {
      applyFiltersAndSort(products, priceRange, selectedSort);
    }
  }, [priceRange, selectedSort, isPriceFilterActive]);

  // Handler functions
  const handlePriceRangeChange = (event, newValue) => {
    setIsPriceFilterActive(true);
    setPriceRange(newValue);
  };
  
  const handleClearPriceFilter = () => {
    setIsPriceFilterActive(false);
    // Reset to default range but don't apply filter
    setPriceRange([0, 100]);
  };

  const handleSortChange = (sortValue) => {
    setSelectedSort(sortValue);
  };

  const handleCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSave = (productId) => {
    console.log('Saved product:', productId);
    // Add save functionality here
  };

  const handleAddToCart = (productId) => {
    console.log('Added to cart:', productId);
    // Add cart functionality here
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        pt: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        pt: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', pt: 8 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar - Filters */}
          <Grid item xs={12} md={3}>
            <FilterSidebar
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
              isPriceFilterActive={isPriceFilterActive}
              onClearPriceFilter={handleClearPriceFilter}
            />
          </Grid>

          {/* Main Content - Product Grid */}
          <Grid item xs={12} md={9}>
            {/* Search and Sort Bar */}
            <SearchAndSort
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              sortOptions={sortOptions}
              selectedSort={selectedSort}
              onSortChange={handleSortChange}
            />

            {/* Product Grid */}
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} lg={4} key={product._id}>
                  <ProductCard
                    product={{
                      id: product._id,
                      name: product.name,
                      price: `Rs. ${product.price[0]?.price || 0}`,
                      category: product.category,
                      image: product.image,
                      bgColor: '#f5f5f5'
                    }}
                    originalProduct={product}
                    onCardClick={() => handleCardClick(product._id)}
                    onSave={handleSave}
                    onAddToCart={handleAddToCart}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EMandi; 