const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const IS_VERCEL = import.meta.env.VITE_VERCEL === 'true';

// Normalize file paths for URL compatibility
const normalizePath = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  return filePath.replace(/^[\\/]/, '');
};

// Get the full URL for a file
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // Normalize the path
  const normalizedPath = normalizePath(filePath);
  
  // For Vercel, use the API route
  if (IS_VERCEL) {
    return `${BACKEND_URL}/api/uploads/${normalizedPath}`;
  }
  
  // For local development
  return `${BACKEND_URL}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
};

// Get image URL
export const getImageUrl = (imagePath) => {
  return getFileUrl(imagePath);
};

// Get document URL
export const getDocumentUrl = (documentPath) => {
  return getFileUrl(documentPath);
};

// Check if file is an image
export const isImageFile = (filePath) => {
  if (!filePath) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
};

// Check if file is a document
export const isDocumentFile = (filePath) => {
  if (!filePath) return false;
  return /\.(pdf|doc|docx)$/i.test(filePath);
};