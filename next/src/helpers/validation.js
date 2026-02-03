/**
 * Validation utility functions
 * Common functions for validating data, forms, etc.
 */

/**
 * Check if a value is a valid email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a value is a valid phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid phone number, false otherwise
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's between 10-15 digits
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Check if a value is a valid password
 * @param {string} password - The password to validate
 * @param {number} minLength - Minimum length (default: 8)
 * @returns {object} Object with isValid boolean and errors array
 */
export const validatePassword = (password, minLength = 8) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if a value is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid URL, false otherwise
 */
export const isValidUrl = (url) => {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a value is a valid date
 * @param {string|Date} date - The date to validate
 * @returns {boolean} True if valid date, false otherwise
 */
export const isValidDate = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Check if a value is a valid number
 * @param {any} value - The value to validate
 * @returns {boolean} True if valid number, false otherwise
 */
export const isValidNumber = (value) => {
  if (value === null || value === undefined) return false;
  return !isNaN(value) && isFinite(value);
};

/**
 * Check if a value is not empty
 * @param {any} value - The value to validate
 * @returns {boolean} True if not empty, false otherwise
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};
