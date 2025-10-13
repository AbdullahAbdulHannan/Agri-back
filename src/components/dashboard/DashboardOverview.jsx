import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const salesData = [
  { month: 'Jan', thisYear: 10, lastYear: 8 },
  { month: 'Feb', thisYear: 8, lastYear: 12 },
  { month: 'Mar', thisYear: 12, lastYear: 15 },
  { month: 'Apr', thisYear: 18, lastYear: 10 },
  { month: 'May', thisYear: 22, lastYear: 12 },
  { month: 'Jun', thisYear: 20, lastYear: 18 },
  { month: 'Jul', thisYear: 25, lastYear: 20 },
];

const trafficData = [
  { name: 'United States', value: 52.1, color: '#2E3A59' },
  { name: 'Canada', value: 22.8, color: '#4CAF50' },
  { name: 'Mexico', value: 13.9, color: '#FF9800' },
  { name: 'Other', value: 11.2, color: '#F44336' },
];

const DashboardOverview = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [timeFilter, setTimeFilter] = useState('today');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const metricsCards = [
    {
      title: 'Views',
      value: '7,265',
      change: '+11.01%',
      isPositive: true,
      color: '#4CAF50'
    },
    {
      title: 'Visits',
      value: '3,671',
      change: '-0.03%',
      isPositive: false,
      color: '#FF9800'
    },
    {
      title: 'New Users',
      value: '156',
      change: '+15.03%',
      isPositive: true,
      color: '#2196F3'
    },
    {
      title: 'Active Users',
      value: '2,318',
      change: '+6.08%',
      isPositive: true,
      color: '#9C27B0'
    }
  ];

  const tabLabels = ['Total Sale', 'Total Projects', 'Operating Status'];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Overview
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

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor:'#E6F1FD',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {card.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 2,  }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {card.value}
                </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {card.isPositive ? (
                      <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 16 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: '#F44336', fontSize: 16 }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: card.isPositive ? '#4CAF50' : '#F44336',
                        fontWeight: 600
                      }}
                    >
                      {card.change}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      {/* <Grid container spacing={3}> */}
        {/* Sales/Projects Graph */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            height: 400,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {tabLabels[tabValue]}
                </Typography>
                <Tabs value={tabValue} onChange={handleTabChange} size="small">
                  {tabLabels.map((label, index) => (
                    <Tab key={index} label={label} />
                  ))}
                </Tabs>
              </Box>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="thisYear" 
                    stroke="#000" 
                    strokeWidth={2}
                    name="This year"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lastYear" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Last year"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Traffic by Location */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            height: 400,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Traffic by Location
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' ,flexDirection:'row' }}>

              <ResponsiveContainer width="40%" height={250} >
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: 8
                    }}
                  />
                </PieChart>

                    </ResponsiveContainer>
              {/* Legend */}
              <Box sx={{ mt: 2 }}>
                {trafficData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: item.color,
                        mr: 1
                      }} 
                    />
                    <Typography variant="body2" sx={{ flex: 1 , mr:45}}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
    </Box>
  );
};

export default DashboardOverview; 