const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get the appropriate file URL
 * @param {string} filePath - File path or URL
 * @returns {string} - Full URL to the file
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // If it's a Cloudinary public ID
  if (filePath.startsWith('v')) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${filePath}`;
  }
  
  // For local development or non-Cloudinary files
  return `${BACKEND_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};

/**
 * Get image URL with optional transformations
 * @param {string} imagePath - Image path or URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @param {string} crop - Crop mode (default: 'fill')
 * @returns {string} - Transformed image URL
 */
export const getImageUrl = (imagePath, width = 800, height = 600, crop = 'fill') => {
  if (!imagePath) return '';
  
  // For Cloudinary URLs
  if (imagePath.includes('res.cloudinary.com')) {
    const parts = imagePath.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},h_${height},c_${crop}/${parts[1]}`;
    }
  }
  
  // For local files or other URLs
  return getFileUrl(imagePath);
};

/**
 * Check if a file is an image
 * @param {string} fileName - File name or URL
 * @returns {boolean} - True if the file is an image
 */
export const isImageFile = (fileName) => {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = fileName.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(`.${ext}`);
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};