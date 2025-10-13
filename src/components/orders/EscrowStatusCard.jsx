import React from 'react';
import { Box, Typography, Paper, Divider, Button, LinearProgress, Chip, Tooltip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import { 
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  Gavel as DisputeIcon,
  Info as InfoIcon,
  LocalAtm as ReleaseFundsIcon
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}));

const StatusStep = ({ active, completed, icon, title, description, isLast = false }) => {
  return (
    <Box sx={{ 
      display: 'flex',
      position: 'relative',
      pb: isLast ? 0 : 4,
      '&:not(:last-child)::after': {
        content: '""',
        position: 'absolute',
        left: 15,
        top: 36,
        bottom: 0,
        width: '2px',
        bgcolor: completed ? 'primary.main' : 'action.disabled',
      }
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: completed ? 'primary.main' : active ? 'primary.light' : 'action.disabledBackground',
        color: completed ? 'primary.contrastText' : 'text.secondary',
        mr: 2,
        flexShrink: 0,
        zIndex: 1,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight={active || completed ? 'bold' : 'normal'}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const EscrowStatusCard = ({ order, onReleaseFunds, onRaiseDispute, isSeller = false }) => {
  if (!order?.escrowDetails) return null;

  const { 
    status, 
    releaseDate, 
    releasedAt,
    disputeRaised,
    disputeResolved,
    disputeReason,
    resolution
  } = order.escrowDetails;

  const isReleased = status === 'released';
  const isDisputed = disputeRaised && !disputeResolved;
  const isHeld = status === 'held_in_escrow';
  
  const formattedReleaseDate = releaseDate ? format(new Date(releaseDate), 'MMM d, yyyy') : 'Processing...';
  const formattedReleasedDate = releasedAt ? format(new Date(releasedAt), 'MMM d, yyyy') : null;
  
  const daysRemaining = releaseDate 
    ? Math.ceil((new Date(releaseDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const progress = Math.max(0, Math.min(100, 100 - (daysRemaining / 14) * 100));

  // Ensure status is a string before calling replace
  const displayStatus = status ? status.replace('_', ' ').toUpperCase() : 'PENDING';
  
  return (
    <StyledPaper elevation={0}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Escrow Status
        </Typography>
        
      </Box>

      <Box mb={3}>
        <StatusStep
          active={isHeld && !isDisputed}
          completed={isReleased || isDisputed}
          icon={isReleased ? <CheckCircleIcon fontSize="small" /> : <TimeIcon fontSize="small" />}
          title={
            isReleased 
              ? `Funds released on ${formattedReleasedDate}`
              : isDisputed
                ? 'Funds held due to dispute'
                : `Funds held in escrow until ${formattedReleaseDate}`
          }
          description={
            isReleased 
              ? 'The seller has received the payment.'
              : isDisputed
                ? 'This order has an active dispute.'
                : `Automatic release in ~${daysRemaining} days`
          }
        />
        
        {isHeld && !isDisputed && (
          <StatusStep
            active={!isReleased && !isDisputed}
            completed={isReleased}
            icon={isReleased ? <CheckCircleIcon fontSize="small" /> : <ReleaseFundsIcon fontSize="small" />}
            title={
              isReleased 
                ? 'Funds released to seller'
                : isSeller
                  ? 'Awaiting release'
                  : 'Release funds early'
            }
            description={
              isReleased
                ? `Funds were released on ${formattedReleasedDate}`
                : isSeller
                  ? 'The buyer can release funds early if satisfied.'
                  : 'You can release funds to the seller early if you\'re satisfied with your order.'
            }
            isLast={isReleased}
          />
        )}

        {!isReleased && !isDisputed && !isSeller && (
          <Box mt={2}>
           
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onRaiseDispute}
              startIcon={<DisputeIcon />}
            >
              Raise Dispute
            </Button>
          </Box>
        )}

        {isDisputed && (
          <Box mt={2} p={2} bgcolor="error.background" borderRadius={1}>
            <Box display="flex" alignItems="center" mb={1}>
              <DisputeIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="error">
                Dispute Raised
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Reason:</strong> {disputeReason || 'No reason provided'}
            </Typography>
            {resolution && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Resolution:</strong> {resolution}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {isHeld && !isDisputed && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Time remaining in escrow:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            color={progress > 90 ? 'error' : 'primary'}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="text.secondary">
              Order placed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Auto-release: {formattedReleaseDate}
            </Typography>
          </Box>
        </Box>
      )}
    </StyledPaper>
  );
};

export default EscrowStatusCard;
