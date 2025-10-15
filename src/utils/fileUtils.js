const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const IS_VERCEL = import.meta.env.VITE_VERCEL === 'true';

// Simple URL checker - returns the URL as is since Cloudinary provides full URLs
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  return filePath;
};

// Get image URL - returns the URL as is
export const getImageUrl = (imagePath) => {
  return imagePath || '';
};

// Get document URL - returns the URL as is
export const getDocumentUrl = (documentPath) => {
  return documentPath || '';
};

// Check if file is an image
export const isImageFile = (filePath) => {
  if (!filePath) return false;
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(filePath);
};

// Check if file is a document
export const isDocumentFile = (filePath) => {
  if (!filePath) return false;
  return /\.(pdf|doc|docx)(\?.*)?$/i.test(filePath);
};

// Check if URL is from Cloudinary
export const isCloudinaryUrl = (url) => {
  return url && (url.includes('res.cloudinary.com') || url.startsWith('http'));
};

// Get optimized image URL with transformations
export const getOptimizedImage = (url, width = 300, height = 200, crop = 'fill') => {
  if (!url) return '';
  if (!isCloudinaryUrl(url)) return url;
  
  // If it's already a Cloudinary URL with transformations, return as is
  if (url.includes('/image/upload/')) {
    return url;
  }
  
  // Insert transformations into the URL
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/c_${crop},w_${width},h_${height},q_auto,f_auto/${parts[1]}`;
  }
  
  return url;
};