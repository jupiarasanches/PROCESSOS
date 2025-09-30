import { FILE_UPLOAD_CONFIG } from './constants';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateFile = (file) => {
  const errors = [];
  
  if (!FILE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não suportado: ${file.type}`);
  }
  
  if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
    errors.push(`Arquivo muito grande: máximo ${FILE_UPLOAD_CONFIG.maxSize / (1024 * 1024)}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};