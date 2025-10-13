import React from 'react';
import { Box, Typography, Paper, Divider, Button, Alert, Collapse, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import { useTheme } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const EscrowOrderSummary = ({ order, onConfirm, loading = false, error = null }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  if (!order) return null;

  const { items = [], totalAmount, escrowDetails } = order;
  const platformFee = totalAmount * 0.05; // 5% platform fee
  const amountInEscrow = totalAmount + platformFee;
  const releaseDate = escrowDetails?.releaseDate 
    ? new Date(escrowDetails.releaseDate).toLocaleDateString() 
    : '14 days after delivery';

  return (
    <StyledPaper>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Escrow Payment Summary
        </Typography>
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          size="small"
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Your payment will be held securely in escrow until you confirm the order is delivered as expected.
          </Typography>
          
          <Box display="flex" alignItems="center" mt={1} mb={1}>
            <InfoIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="primary">
              Funds will be automatically released to the seller on {releaseDate}
            </Typography>
          </Box>
        </Box>
      </Collapse>

      <Divider sx={{ my: 2 }} />

      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Order Total:</Typography>
          <Typography variant="body2" fontWeight="medium">
            ${totalAmount?.toFixed(2) || '0.00'}
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Platform Fee (5%):</Typography>
          <Typography variant="body2" color="text.secondary">
            ${platformFee.toFixed(2)}
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            Total in Escrow:
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            ${amountInEscrow.toFixed(2)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={onConfirm}
          disabled={loading}
          sx={{ mt: 2, py: 1.5 }}
        >
          {loading ? 'Processing...' : 'Confirm & Pay with Escrow'}
        </Button>

        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          By confirming, you agree to our Escrow Terms and Conditions
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default EscrowOrderSummary;
