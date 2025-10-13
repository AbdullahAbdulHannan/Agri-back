import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon
} from '@mui/icons-material';

const SearchAndSort = ({ 
  searchValue, 
  onSearchChange, 
  sortOptions, 
  selectedSort, 
  onSortChange 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      backgroundColor: 'white', 
      borderRadius: 2, 
      p: 3, 
      mb: 3,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexWrap: 'wrap'
    }}>
      <TextField
        placeholder="Search"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#666' }} />
            </InputAdornment>
          ),
        }}
        sx={{ flexGrow: 1, minWidth: 200 }}
      />
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedSort === option.value ? "contained" : "outlined"}
            size="small"
            onClick={() => onSortChange(option.value)}
            sx={{
              backgroundColor: selectedSort === option.value ? 'black' : '#d5d2d2',
              color: selectedSort === option.value ? 'white' : '#656161',
              borderColor:  selectedSort === option.value ? 'black' : '#d5d2d2',
              textTransform: 'none',
            }}
          >
            {option.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default SearchAndSort; 