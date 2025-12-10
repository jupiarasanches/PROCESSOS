export const validateFile = (file) => {
  const errors = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Validação de tamanho
  if (file.size > maxSize) {
    errors.push('Arquivo muito grande. Tamanho máximo: 10MB');
  }

  // Validação de tipo
  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de arquivo não permitido. Use: PDF, JPG, PNG ou Word');
  }

  // Validação de nome
  if (!file.name || file.name.trim().length === 0) {
    errors.push('Nome do arquivo é obrigatório');
  }

  // Validação de extensão
  const extension = file.name.split('.').pop().toLowerCase();
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
  if (!allowedExtensions.includes(extension)) {
    errors.push('Extensão de arquivo não permitida');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePersonalEmail = (email) => {
  if (!validateEmail(email)) return false;
  const domain = String(email).trim().toLowerCase().split('@')[1] || '';
  const allowed = ['gmail.com', 'gmail.com.br', 'hotmail.com', 'hotmail.com.br', 'outlook.com', 'outlook.com.br'];
  return allowed.includes(domain);
};

export const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se é uma sequência de números iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;
  
  if (parseInt(cleanCPF.charAt(9)) !== digit1) {
    return false;
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;
  
  return parseInt(cleanCPF.charAt(10)) === digit2;
};

export const validatePhone = (phone) => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

export const validateCEP = (cep) => {
  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  return cleanCEP.length === 8;
};

export const validateDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

export const validateRequired = (value) => {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  
  return true;
};

export const validateMinLength = (value, minLength) => {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length <= maxLength;
};

export const validateRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};