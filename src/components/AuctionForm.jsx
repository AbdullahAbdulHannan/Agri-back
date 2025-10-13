import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, TextField,
  FormControl, InputLabel, Select, MenuItem, Grid, Paper, IconButton,
  Alert, Card, CardMedia, CardContent, FormHelperText,
  InputAdornment
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import { getImageUrl, getDocumentUrl } from '../utils/fileUtils';

const AuctionForm = ({ 
  mode = 'create', // 'create' or 'edit'
  auction = null, 
  onSubmit, 
  loading = false, 
  onClose,
  currentStep = 0,
  onStepChange
}) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    area: '',
    landType: '',
    leaseType: '',
    cropType: '',
    plantAge: '',
    waterSource: '',
    soilType: '',
    yield: '',
    startingBid: '',
    bidIncrement: '',
    reservePrice: '',
    startTime: '',
    endTime: '',
    leaseDuration: '',
    paymentTerms: '',
    securityDeposit: ''
  });
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documentNames, setDocumentNames] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [visitedSteps, setVisitedSteps] = useState(new Set([0])); // Track visited steps
  const [originalData, setOriginalData] = useState(null); // Store original data for edit mode

  // Initialize form data when auction prop changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && auction) {
      const initialData = {
        title: auction.title || '',
        location: auction.location || '',
        area: auction.area || '',
        landType: auction.landType || '',
        leaseType: auction.leaseType || '',
        cropType: auction.cropType || '',
        plantAge: auction.plantAge || '',
        waterSource: auction.waterSource || '',
        soilType: auction.soilType || '',
        yield: auction.yield || '',
        startingBid: auction.startingBid || '',
        bidIncrement: auction.bidIncrement || '',
        reservePrice: auction.reservePrice || '',
        startTime: auction.startTime ? auction.startTime.slice(0, 16) : '',
        endTime: auction.endTime ? auction.endTime.slice(0, 16) : '',
        leaseDuration: auction.leaseDuration || '',
        paymentTerms: auction.paymentTerms || '',
        securityDeposit: auction.securityDeposit || ''
      };
      
      setFormData(initialData);
      setOriginalData(initialData); // Store original data for comparison
      
      // Set existing files
      setExistingImages(auction.images || []);
      setExistingDocuments(auction.documents || []);
      
      // Mark all steps as visited in edit mode since data exists
      setVisitedSteps(new Set([0, 1, 2, 3, 4]));
    }
  }, [mode, auction]);

  // Check if a field has been modified in edit mode
  const hasFieldChanged = (field) => {
    if (mode !== 'edit' || !originalData) return true; // Always validate in create mode
    
    const currentValue = formData[field];
    const originalValue = originalData[field];
    
    // For date fields, normalize the comparison
    if (field === 'startTime' || field === 'endTime') {
      // If both values are empty, consider them unchanged
      if (!currentValue && !originalValue) return false;
      
      // If one is empty and the other isn't, consider it changed
      if (!currentValue || !originalValue) return true;
      
      // Normalize both values to the same format for comparison
      const currentDate = new Date(currentValue);
      const originalDate = new Date(originalValue);
      
      // Compare the normalized date strings
      return currentDate.getTime() !== originalDate.getTime();
    }
    
    // For other fields, direct comparison
    return currentValue !== originalValue;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = currentStep + 1;
      setVisitedSteps(prev => new Set([...prev, currentStep, nextStep]));
      onStepChange(nextStep);
    }
  };
  
  const handleBack = () => {
    onStepChange(currentStep - 1);
  };

  const handleFileUpload = (event, type) => {
    const files = Array.from(event.target.files);
    
    if (type === 'images') {
      const newImages = [...images, ...files];
      if (newImages.length > 10) {
        setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
        return;
      }
      setImages(newImages);
      
      // Create previews for images
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    } else {
      const newDocuments = [...documents, ...files];
      if (newDocuments.length > 5) {
        setErrors(prev => ({ ...prev, documents: 'Maximum 5 documents allowed' }));
        return;
      }
      setDocuments(newDocuments);
      
      // Store document names
      const newNames = files.map(file => file.name);
      setDocumentNames(prev => [...prev, ...newNames]);
    }
    
    setErrors(prev => ({ ...prev, [type]: '' }));
  };

  const handleFileRemove = (index, type) => {
    if (type === 'images') {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      
      // Remove preview
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);
    } else {
      const newDocuments = documents.filter((_, i) => i !== index);
      setDocuments(newDocuments);
      
      // Remove name
      const newNames = documentNames.filter((_, i) => i !== index);
      setDocumentNames(newNames);
    }
  };

  const handleExistingFileRemove = (index, type) => {
    if (type === 'images') {
      const newImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(newImages);
    } else {
      const newDocuments = existingDocuments.filter((_, i) => i !== index);
      setExistingDocuments(newDocuments);
    }
  };

  // Check if a step has data
  const hasStepData = (step) => {
    switch (step) {
      case 0: // Basic Information
        return formData.title.trim() || formData.location.trim() || formData.area || formData.landType || formData.leaseType;
      case 1: // Farm Details
        return formData.cropType.trim() || formData.waterSource.trim() || formData.soilType.trim();
      case 2: // Auction Details
        return formData.startingBid || formData.bidIncrement || formData.startTime || formData.endTime || formData.leaseDuration;
      case 3: // Contact Information
        return true; // Always accessible
      case 4: // Images & Documents
        return existingImages.length > 0 || existingDocuments.length > 0 || images.length > 0 || documents.length > 0;
      default:
        return false;
    }
  };

  // Check if a step can be accessed
  const canAccessStep = (step) => {
    // In edit mode, allow access to all steps since data exists
    if (mode === 'edit') {
      return true;
    }
    // In create mode, only allow access to visited steps with data
    return visitedSteps.has(step) && hasStepData(step);
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 0: // Basic Information
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.area || formData.area <= 0) newErrors.area = 'Valid area is required';
        if (!formData.landType) newErrors.landType = 'Land type is required';
        if (!formData.leaseType) newErrors.leaseType = 'Lease type is required';
        break;
      case 1: // Farm Details
        if (!formData.cropType.trim()) newErrors.cropType = 'Crop type is required';
        if (!formData.waterSource.trim()) newErrors.waterSource = 'Water source is required';
        if (!formData.soilType.trim()) newErrors.soilType = 'Soil type is required';
        break;
      case 2: // Auction Details
        if (!formData.startingBid || formData.startingBid <= 0) newErrors.startingBid = 'Valid starting bid is required';
        if (!formData.bidIncrement || formData.bidIncrement <= 0) newErrors.bidIncrement = 'Valid bid increment is required';
        if (!formData.startTime) newErrors.startTime = 'Start time is required';
        if (!formData.endTime) newErrors.endTime = 'End time is required';
        if (!formData.leaseDuration || formData.leaseDuration <= 0) newErrors.leaseDuration = 'Valid lease duration is required';
        
        // Validate that end time is after start time only if times have been changed
        if (formData.startTime && formData.endTime) {
          const startTimeChanged = hasFieldChanged('startTime');
          const endTimeChanged = hasFieldChanged('endTime');
          
          console.log('Edit mode validation check:', {
            mode,
            startTimeChanged,
            endTimeChanged,
            currentStartTime: formData.startTime,
            originalStartTime: originalData?.startTime,
            currentEndTime: formData.endTime,
            originalEndTime: originalData?.endTime
          });
          
          // Only validate if either start time or end time has been modified
          if (startTimeChanged || endTimeChanged) {
            const startTime = new Date(formData.startTime);
            const endTime = new Date(formData.endTime);
            if (endTime <= startTime) {
              newErrors.endTime = 'End time must be after start time';
            }
          }
          // If neither time has been changed, skip validation entirely
        }
        break;
      case 3: // Contact Information
        // Contact info is handled by ownerId from auth
        break;
      case 4: // Images & Documents
        if (existingImages.length + images.length === 0) newErrors.images = 'At least one image is required';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleNext = () => {
  //   if (validateStep(currentStep) && onStepChange) {
  //     // Mark current step as visited
  //     setVisitedSteps(prev => new Set([...prev, currentStep]));
  //     onStepChange(currentStep + 1);
  //   }
  // };

  // const handleBack = () => {
  //   if (onStepChange) {
  //     onStepChange(currentStep - 1);
  //   }
  // };

  const handleSubmit = async () => {
    if (!validateStep(4)) return; // Validate final step

    const auctionData = {
      ...formData,
      images: images,
      documents: documents,
      existingImages: existingImages,
      existingDocuments: existingDocuments
    };

    try {
      await onSubmit(auctionData);
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} auction:`, error);
    }
  };

  // Render form fields based on current step
  const renderFormFields = (step) => {
    switch (step) {
      case 0:
        return <BasicInfoFields formData={formData} errors={errors} handleInputChange={handleInputChange} />;
      case 1:
        return <FarmDetailsFields formData={formData} errors={errors} handleInputChange={handleInputChange} />;
      case 2:
        return <AuctionDetailsFields formData={formData} errors={errors} handleInputChange={handleInputChange} />;
      case 3:
        return <ContactInfoFields />;
      case 4:
        return (
          <FileUploadFields
            images={images}
            documents={documents}
            existingImages={existingImages}
            existingDocuments={existingDocuments}
            imagePreviews={imagePreviews}
            documentNames={documentNames}
            errors={errors}
            handleFileUpload={handleFileUpload}
            handleFileRemove={handleFileRemove}
            handleExistingFileRemove={handleExistingFileRemove}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {renderFormFields(currentStep)}
      
      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Button
            disabled={currentStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button
            onClick={onClose}
            color="inherit"
          >
            Cancel
          </Button>
        </Box>
        
        <Box>
          {currentStep < 4 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {mode === 'create' ? 'Create Auction' : 'Update Auction'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Separate components for each step to reduce main component size
const BasicInfoFields = ({ formData, errors, handleInputChange }) => (
  <Box>
    <Typography variant="h6" gutterBottom fontWeight={600}>
      Basic Information
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Auction Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Location"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          error={!!errors.location}
          helperText={errors.location}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Area (acres)"
          type="number"
          value={formData.area}
          onChange={(e) => handleInputChange('area', e.target.value)}
          error={!!errors.area}
          helperText={errors.area}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.landType}>
          <InputLabel>Land Type</InputLabel>
          <Select
            value={formData.landType}
            onChange={(e) => handleInputChange('landType', e.target.value)}
            label="Land Type"
          >
            <MenuItem value="agricultural">Agricultural</MenuItem>
            <MenuItem value="irrigated">Irrigated</MenuItem>
            <MenuItem value="rainfed">Rainfed</MenuItem>
            <MenuItem value="mixed">Mixed</MenuItem>
          </Select>
          {errors.landType && <FormHelperText>{errors.landType}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.leaseType}>
          <InputLabel>Lease Type</InputLabel>
          <Select
            value={formData.leaseType}
            onChange={(e) => handleInputChange('leaseType', e.target.value)}
            label="Lease Type"
          >
            <MenuItem value="long-term">Long-term</MenuItem>
            <MenuItem value="medium-term">Medium-term</MenuItem>
            <MenuItem value="short-term">Short-term</MenuItem>
            <MenuItem value="seasonal">Seasonal</MenuItem>
          </Select>
          {errors.leaseType && <FormHelperText>{errors.leaseType}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  </Box>
);

const FarmDetailsFields = ({ formData, errors, handleInputChange }) => (
  <Box>
    <Typography variant="h6" gutterBottom fontWeight={600}>
      Farm Details
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Crop Type"
          value={formData.cropType}
          onChange={(e) => handleInputChange('cropType', e.target.value)}
          error={!!errors.cropType}
          helperText={errors.cropType}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Plant Age (months)"
          type="number"
          value={formData.plantAge}
          onChange={(e) => handleInputChange('plantAge', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Water Source"
          value={formData.waterSource}
          onChange={(e) => handleInputChange('waterSource', e.target.value)}
          error={!!errors.waterSource}
          helperText={errors.waterSource}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Soil Type"
          value={formData.soilType}
          onChange={(e) => handleInputChange('soilType', e.target.value)}
          error={!!errors.soilType}
          helperText={errors.soilType}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Expected Yield"
          value={formData.yield}
          onChange={(e) => handleInputChange('yield', e.target.value)}
        />
      </Grid>
    </Grid>
  </Box>
);

const AuctionDetailsFields = ({ formData, errors, handleInputChange }) => (
  <Box>
    <Typography variant="h6" gutterBottom fontWeight={600}>
      Auction Details
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Starting Bid (Rs.)"
          type="number"
          value={formData.startingBid}
          onChange={(e) => handleInputChange('startingBid', e.target.value)}
          error={!!errors.startingBid}
          helperText={errors.startingBid}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Bid Increment (Rs.)"
          type="number"
          value={formData.bidIncrement}
          onChange={(e) => handleInputChange('bidIncrement', e.target.value)}
          error={!!errors.bidIncrement}
          helperText={errors.bidIncrement}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Reserve Price (Rs.)"
          type="number"
          value={formData.reservePrice}
          onChange={(e) => handleInputChange('reservePrice', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Lease Duration (years)"
          type="number"
          value={formData.leaseDuration}
          onChange={(e) => handleInputChange('leaseDuration', e.target.value)}
          error={!!errors.leaseDuration}
          helperText={errors.leaseDuration}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Auction Start Time"
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => handleInputChange('startTime', e.target.value)}
          error={!!errors.startTime}
          helperText={errors.startTime}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Auction End Time"
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => handleInputChange('endTime', e.target.value)}
          error={!!errors.endTime}
          helperText={errors.endTime}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Payment Terms"
          value={formData.paymentTerms}
          onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Security Deposit (Rs.)"
          type="number"
          value={formData.securityDeposit}
          onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
          }}
        />
      </Grid>
    </Grid>
  </Box>
);

const ContactInfoFields = () => (
  <Box>
    <Typography variant="h6" gutterBottom fontWeight={600}>
      Contact Information
    </Typography>
    <Alert severity="info" sx={{ mb: 2 }}>
      Contact information is automatically handled based on your account details.
    </Alert>
    <Typography variant="body2" color="text.secondary">
      Your contact information will be displayed to bidders based on your profile.
    </Typography>
  </Box>
);

const FileUploadFields = ({
  images,
  documents,
  existingImages,
  existingDocuments,
  imagePreviews,
  documentNames,
  errors,
  handleFileUpload,
  handleFileRemove,
  handleExistingFileRemove
}) => (
  <Box>
    <Typography variant="h6" gutterBottom fontWeight={600}>
      Images & Documents
    </Typography>
    <Grid container spacing={3}>
      {/* Images Section */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" gutterBottom>
          Images ({existingImages.length + images.length}/10)
        </Typography>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Images:
            </Typography>
            <Grid container spacing={1}>
              {existingImages.map((image, index) => (
                <Grid item xs={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="100"
                      image={getImageUrl(image)}
                      alt={`Image ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleExistingFileRemove(index, 'images')}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* New Images */}
        {images.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              New Images:
            </Typography>
            <Grid container spacing={1}>
              {imagePreviews.map((preview, index) => (
                <Grid item xs={4} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="100"
                      image={preview}
                      alt={`New Image ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleFileRemove(index, 'images')}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={existingImages.length + images.length >= 10}
          fullWidth
        >
          Upload Images
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'images')}
          />
        </Button>
        {errors.images && (
          <FormHelperText error>{errors.images}</FormHelperText>
        )}
      </Grid>

      {/* Documents Section */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle1" gutterBottom>
          Documents ({existingDocuments.length + documents.length}/5)
        </Typography>
        
        {/* Existing Documents */}
        {existingDocuments.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Documents:
            </Typography>
            {existingDocuments.map((document, index) => (
              <Paper key={index} sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  {document.split('/').pop()}
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    href={getDocumentUrl(document)}
                    target="_blank"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleExistingFileRemove(index, 'documents')}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* New Documents */}
        {documents.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              New Documents:
            </Typography>
            {documentNames.map((name, index) => (
              <Paper key={index} sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  {name}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleFileRemove(index, 'documents')}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Box>
        )}

        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={existingDocuments.length + documents.length >= 5}
          fullWidth
        >
          Upload Documents
          <input
            type="file"
            hidden
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e, 'documents')}
          />
        </Button>
        {errors.documents && (
          <FormHelperText error>{errors.documents}</FormHelperText>
        )}
      </Grid>
    </Grid>
  </Box>
);

export default AuctionForm;
