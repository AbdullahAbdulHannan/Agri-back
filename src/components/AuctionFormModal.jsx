import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Grid,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import AuctionForm from './AuctionForm';
import { auctionService } from '../services/auctionService';

const steps = [
  'Basic Information', 'Farm Details', 'Auction Details', 'Contact Information', 'Images & Documents'
];

const AuctionFormModal = ({ 
  open, 
  onClose, 
  mode = 'create', // 'create' or 'edit'
  auction = null,
  onSubmit,
  loading = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStepChange = (step) => {
    // In edit mode, allow navigation to any step
    if (mode === 'edit') {
      setActiveStep(step);
      return;
    }
    
    // In create mode, only allow navigation to steps that have been visited and have data
    if (visitedSteps.has(step)) {
      setActiveStep(step);
    }
  };

  const handleClose = () => {
    setActiveStep(0); // Reset to first step when closing
    setVisitedSteps(new Set([0])); // Reset visited steps
    setError('');
    onClose();
  };

  const handleAuctionSubmit = async (auctionData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const createdAuction = await auctionService.createAuction(auctionData);
      
      if (onSubmit) {
        onSubmit(createdAuction);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    return mode === 'create' ? 'Create New Auction' : 'Edit Auction';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown={false}
      onBackdropClick={(event) => {
        // Prevent closing when clicking outside
        event.stopPropagation();
      }}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {getTitle()}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Vertical Step Navigation */}
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Steps
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel 
                      onClick={() => handleStepChange(index)}
                      sx={{ 
                        cursor: mode === 'edit' || visitedSteps.has(index) ? 'pointer' : 'default',
                        '&:hover': {
                          color: mode === 'edit' || visitedSteps.has(index) ? 'primary.main' : 'inherit'
                        },
                        opacity: mode === 'edit' || visitedSteps.has(index) ? 1 : 0.5
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Grid>

          {/* Form Content */}
          <Grid item xs={12} md={9}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <AuctionForm
              mode={mode}
              auction={auction}
              onSubmit={handleAuctionSubmit}
              loading={isSubmitting}
              onClose={handleClose}
              currentStep={activeStep}
              onStepChange={(step) => {
                setActiveStep(step);
                // Mark the new step as visited
                setVisitedSteps(prev => new Set([...prev, step]));
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AuctionFormModal;
