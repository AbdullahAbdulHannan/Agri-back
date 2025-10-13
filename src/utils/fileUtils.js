// Utility functions for handling file URLs

const BACKEND_URL = import.meta.env.VITE_API_URL ;

// Normalize path separators and ensure proper URL formatting
const normalizePath = (filePath) => {
  if (!filePath) return null;
  
  // Replace backslashes with forward slashes for URL compatibility
  let normalizedPath = filePath.replace(/\\/g, '/');
  
  // Ensure the path starts with a forward slash
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  
  return normalizedPath;
};

// Convert relative file path to full URL
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Normalize the path
  const normalizedPath = normalizePath(filePath);
  
  // Add the backend URL
  return `${BACKEND_URL}${normalizedPath}`;
};

// Get image URL for auction cards and modals
export const getImageUrl = (imagePath) => {
  return getFileUrl(imagePath);
};

// Get document URL for viewing/downloading
export const getDocumentUrl = (documentPath) => {
  return getFileUrl(documentPath);
};

// Check if a file path is valid
export const isValidFilePath = (filePath) => {
  return filePath && typeof filePath === 'string' && filePath.length > 0;
};

// Get file extension from path
export const getFileExtension = (filePath) => {
  if (!filePath) return '';
  const lastDot = filePath.lastIndexOf('.');
  return lastDot > 0 ? filePath.substring(lastDot + 1).toLowerCase() : '';
};

// Check if file is an image
export const isImageFile = (filePath) => {
  const ext = getFileExtension(filePath);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
};

// Check if file is a document
export const isDocumentFile = (filePath) => {
  const ext = getFileExtension(filePath);
  return ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext);
}; 