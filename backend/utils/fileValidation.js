/**
 * File Upload Security Utilities
 * - Validates file extensions and MIME types
 * - Prevents malicious file uploads
 */

const path = require('path');

const ALLOWED_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif'],
  pdf: ['pdf']
};

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
  pdf: ['application/pdf']
};

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.image.includes(file.mimetype)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.image.join(', ')}` 
    };
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (!ALLOWED_EXTENSIONS.image.includes(ext)) {
    return { 
      valid: false, 
      error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.image.join(', ')}` 
    };
  }

  return { valid: true };
}

/**
 * Validate PDF file
 * @param {Object} file - Multer file object
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validatePdfFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.pdf.includes(file.mimetype)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.pdf.join(', ')}` 
    };
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (!ALLOWED_EXTENSIONS.pdf.includes(ext)) {
    return { 
      valid: false, 
      error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.pdf.join(', ')}` 
    };
  }

  return { valid: true };
}

module.exports = {
  validateImageFile,
  validatePdfFile,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES
};
