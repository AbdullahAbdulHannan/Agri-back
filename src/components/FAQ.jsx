import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const FAQ = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(0);

  const faqs = [
    {
      question: 'How does AgriBazaar connect farmers and buyers?',
      answer: 'AgriBazaar provides a digital platform where farmers can directly list their products and buyers can purchase fresh produce at fair prices. Our system ensures transparency, quality assurance, and efficient logistics to create a seamless trading experience for both parties.'
    },
    {
      question: 'What are the benefits of using E-Mandi?',
      answer: 'E-Mandi offers several advantages including real-time price discovery, reduced middlemen costs, direct farmer-to-buyer transactions, quality assurance, and convenient payment options. It also provides market insights and helps farmers get better prices for their produce.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once you place an order, you will receive a tracking number via email and SMS. You can track your order status in real-time through our mobile app or website. Our system provides updates at every stage from order confirmation to delivery.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept multiple payment methods including credit/debit cards, net banking, UPI, digital wallets, and cash on delivery. All online transactions are secured with SSL encryption to ensure your financial information remains safe.'
    },
    {
      question: 'How do you ensure product quality?',
      answer: 'We have a comprehensive quality control system that includes pre-listing verification, random quality checks, and buyer feedback mechanisms. All products are inspected for freshness, grade, and packaging standards before being listed on our platform.'
    }
  ];

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ py: 8, backgroundColor: '#ffffff' }}>
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
          Frequently Asked Questions
        </Typography>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === index}
              onChange={handleChange(index)}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: '16px 0',
                  boxShadow: '0 4px 16px rgba(76, 175, 80, 0.15)',
                }
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon 
                    sx={{ 
                      color: '#4CAF50',
                      fontSize: '1.5rem'
                    }} 
                  />
                }
                sx={{
                  px: 3,
                  py: 2,
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                  },
                  '&.Mui-expanded': {
                    backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#000000',
                    fontSize: { xs: '1rem', md: '1.1rem' }
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#666666',
                    lineHeight: 1.6,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ; 