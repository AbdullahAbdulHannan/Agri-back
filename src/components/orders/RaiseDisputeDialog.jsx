import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';

const DISPUTE_REASONS = [
  'Item not as described',
  'Item not received',
  'Item damaged or defective',
  'Seller unresponsive',
  'Other issue',
];

const RaiseDisputeDialog = ({ open, onClose, onSubmit, loading, error }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState({
    reason: false,
    description: false,
  });

  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      reason,
      description: description || 'No additional details provided.',
    });
  };

  const isFormValid = reason.trim() !== '';
  const showReasonError = touched.reason && !reason;
  const showDescriptionError = touched.description && !description.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Raise a Dispute</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please provide details about the issue with your order. Our support team will review your 
            dispute and work to resolve it as quickly as possible.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box mb={3}>
            <FormControl fullWidth error={showReasonError} sx={{ mb: 2 }}>
              <InputLabel id="dispute-reason-label">Reason for dispute *</InputLabel>
              <Select
                labelId="dispute-reason-label"
                id="dispute-reason"
                value={reason}
                label="Reason for dispute *"
                onChange={handleReasonChange}
                onBlur={handleBlur('reason')}
                error={showReasonError}
              >
                {DISPUTE_REASONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {showReasonError && (
                <Typography variant="caption" color="error">
                  Please select a reason for your dispute
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional details"
              placeholder="Please provide as much detail as possible about the issue..."
              value={description}
              onChange={handleDescriptionChange}
              onBlur={handleBlur('description')}
              error={showDescriptionError}
              helperText={
                showDescriptionError ? 'Please provide more details about your issue' : ''
              }
            />
          </Box>

          <Box bgcolor="warning.light" p={2} borderRadius={1}>
            <Typography variant="caption" color="warning.dark">
              <strong>Note:</strong> Raising a dispute will temporarily hold the funds in escrow until 
              the issue is resolved. Please try to resolve the issue directly with the seller first 
              if possible.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="error"
            disabled={!isFormValid || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RaiseDisputeDialog;
