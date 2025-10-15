import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Link,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import logo from '../assets/logo.png';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const footerLinks = {
    useCases: [
      'UI design',
      'UX design', 
      'Wireframing',
      'Diagramming',
      'Brainstorming',
      'Online whiteboard',
      'Team collaboration'
    ],
    explore: [
      'Design',
      'Prototyping',
      'Development features',
      'Design systems',
      'Collaboration features',
      'Design process',
      'FigJam'
    ],
    resources: [
      'Blog',
      'Best practices',
      'Colors',
      'Color wheel',
      'Support',
      'Developers',
      'Resource library'
    ]
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e0e0e0',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Social Media */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img 
                src={logo} 
                alt="AgriBazaar Logo" 
                style={{ 
                  height: '32px', 
                  width: 'auto',
                  marginRight: '12px'
                }} 
              />
              <Typography
                variant="h6"
                sx={{
                  color: '#000000',
                  fontWeight: 600,
                  fontSize: '1.25rem'
                }}
              >
                AgriBazaar
              </Typography>
            </Box>
            
            <Typography
              variant="body2"
              sx={{
                color: '#666666',
                mb: 3,
                lineHeight: 1.6
              }}
            >
              Connecting farmers and buyers through smart agriculture solutions.
            </Typography>

            {/* Social Media Icons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                sx={{
                  color: '#666666',
                  '&:hover': {
                    color: '#1DA1F2',
                    backgroundColor: 'rgba(29, 161, 242, 0.1)',
                  },
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: '#666666',
                  '&:hover': {
                    color: '#E4405F',
                    backgroundColor: 'rgba(228, 64, 95, 0.1)',
                  },
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: '#666666',
                  '&:hover': {
                    color: '#FF0000',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  },
                }}
              >
                <YouTubeIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: '#666666',
                  '&:hover': {
                    color: '#0077B5',
                    backgroundColor: 'rgba(0, 119, 181, 0.1)',
                  },
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Use Cases */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#000000',
                mb: 3,
                fontSize: '1.1rem'
              }}
            >
              Use cases
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.useCases.map((link, index) => (
                <Link
                  key={index}
                  href="#"
                  sx={{
                    color: '#666666',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: '#4CAF50',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {link}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Explore */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#000000',
                mb: 3,
                fontSize: '1.1rem'
              }}
            >
              Explore
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.explore.map((link, index) => (
                <Link
                  key={index}
                  href="#"
                  sx={{
                    color: '#666666',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: '#4CAF50',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {link}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#000000',
                mb: 3,
                fontSize: '1.1rem'
              }}
            >
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.resources.map((link, index) => (
                <Link
                  key={index}
                  href="#"
                  sx={{
                    color: '#666666',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: '#4CAF50',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {link}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Border */}
        <Box
          sx={{
            borderTop: '1px solid #e0e0e0',
            mt: 4,
            pt: 3,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#666666',
              fontSize: '0.85rem'
            }}
          >
            © {new Date().getFullYear()} AgriBazaar. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 