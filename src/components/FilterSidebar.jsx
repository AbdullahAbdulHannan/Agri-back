import React from 'react';
import { Box, Typography, Slider, Button, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FilterSidebar = ({ 
  priceRange, 
  onPriceRangeChange,
  isPriceFilterActive,
  onClearPriceFilter
}) => {
  return (
    <Box sx={{ 
      backgroundColor: 'white', 
      borderRadius: 2, 
      p: 3, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      height: 'fit-content',
      position: 'sticky',
      top: 100
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Price Filter
        </Typography>
        {isPriceFilterActive && (
          <Button 
            size="small" 
            onClick={onClearPriceFilter}
            startIcon={<CloseIcon fontSize="small" />}
            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            Clear
          </Button>
        )}
      </Stack>

      {/* Price Range */}
      <Box sx={{ mb: 3 }}>
        <Slider
          value={priceRange}
          onChange={onPriceRangeChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          valueLabelFormat={(value) => `Rs. ${value}`}
          sx={{
            color: isPriceFilterActive ? 'primary.main' : 'grey.500',
            '& .MuiSlider-thumb': {
              backgroundColor: isPriceFilterActive ? 'primary.main' : 'grey.500',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(0, 0, 0, 0.16)',
              },
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: isPriceFilterActive ? 'primary.main' : 'grey.500',
              color: 'white',
              borderRadius: 1,
              padding: '4px 8px',
              fontSize: '0.75rem',
            },
            '& .MuiSlider-track': {
              border: 'none',
            },
            '& .MuiSlider-rail': {
              opacity: 0.3,
              backgroundColor: 'grey.400',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: isPriceFilterActive ? 'text.primary' : 'text.secondary', fontWeight: isPriceFilterActive ? 600 : 400 }}>
            Rs. {priceRange[0]}
          </Typography>
          <Typography variant="caption" sx={{ color: isPriceFilterActive ? 'text.primary' : 'text.secondary', fontWeight: isPriceFilterActive ? 600 : 400 }}>
            Rs. {priceRange[1]}
          </Typography>
        </Box>
        {!isPriceFilterActive && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
            Adjust to filter by price
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FilterSidebar;