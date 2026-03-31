/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} => {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ thường');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ hoa');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ số');
  } else {
    score++;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu nên chứa ít nhất một ký tự đặc biệt');
  } else {
    score++;
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) strength = 'medium';
  if (score >= 5) strength = 'strong';

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file extension
 */
export const isValidFileExtension = (
  filename: string,
  allowedExtensions: string[]
): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return allowedExtensions.map((ext) => ext.toLowerCase()).includes(extension);
};

/**
 * Validate file size
 */
export const isValidFileSize = (sizeInBytes: number, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

/**
 * Validate Vietnamese ID card number
 */
export const isValidVietnameseId = (id: string): boolean => {
  // Old 9-digit format or new 12-digit format
  const oldFormat = /^\d{9}$/;
  const newFormat = /^\d{12}$/;
  return oldFormat.test(id) || newFormat.test(id);
};

/**
 * Check if string is empty or whitespace only
 */
export const isEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Check if value is within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};
