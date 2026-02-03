/**
 * Formatting utility functions
 * Common functions for formatting numbers, currency, dates, etc.
 */

import { getTemplateConfig } from '@/lib/templateConstants';

/**
 * Format a number with commas for thousands separators
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Get currency from template configuration
 * @returns {string} Currency code
 */
const getCurrencyFromConfig = () => {
  try {
    const templateConfig = getTemplateConfig();
    return templateConfig?.currency || 'IDR';
  } catch (error) {
    // Fallback in case of any error
    console.error('Error getting template config:', error);
    return 'IDR';
  }
};

/**
 * Format currency value with proper formatting
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const currency = getCurrencyFromConfig();
  if (amount === null || amount === undefined) return `0 ${currency}`;

  // Remove decimal places and leading zeros
  const integerAmount = Math.floor(Number(amount));
  const formattedAmount = formatNumber(integerAmount);
  return `${formattedAmount} ${currency}`;
};

/**
 * Format currency value with specific currency (for validation messages)
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (e.g., 'IDR', 'KRW')
 * @returns {string} Formatted currency string
 */
export const formatCurrencyWithCurrency = (amount, currency = 'IDR') => {
  if (amount === null || amount === undefined) return `0 ${currency}`;

  // Remove decimal places and leading zeros
  const integerAmount = Math.floor(Number(amount));
  const formattedAmount = formatNumber(integerAmount);
  return `${formattedAmount} ${currency}`;
};

/**
 * Format amount value with proper formatting (without currency)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount string
 */
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0';

  // Remove decimal places and leading zeros
  const integerAmount = Math.floor(Number(amount));
  const formattedAmount = formatNumber(integerAmount);
  return formattedAmount;
};

/**
 * Format points value
 * @param {number} points - The points to format
 * @returns {string} Formatted points string
 */
export const formatPoints = (points) => {
  if (points === null || points === undefined) return '0 P';

  const formattedPoints = formatNumber(points);
  return `${formattedPoints} P`;
};

/**
 * Format percentage value
 * @param {number} value - The percentage value (0-100)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';

  const formattedValue = parseFloat(value).toFixed(decimals);
  return `${formattedValue}%`;
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format phone number with proper spacing
 * @param {string} phoneNumber - The phone number to format
 * @param {string} countryCode - Country code (default: '+62' for Indonesia)
 * @returns {string} Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber, countryCode = '+62') => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // If it starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    return `${countryCode}${cleaned.substring(1)}`;
  }

  // If it doesn't start with country code, add it
  if (!cleaned.startsWith('62')) {
    return `${countryCode}${cleaned}`;
  }

  return `+${cleaned}`;
};

/**
 * Format amount in millions (always shows in M format)
 * Rounds to 1-2 decimal places (e.g., "1.2M", "1.21M", "3.23M")
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted amount in millions
 */
export const formatAmountInMillions = (amount) => {
  if (amount === null || amount === undefined) return '0M';

  // Convert to number and handle string inputs
  const numAmount =
    typeof amount === 'string' ? parseFloat(amount) : Number(amount);

  if (isNaN(numAmount) || numAmount === 0) return '0M';

  // Convert to millions
  const millions = numAmount / 1000;

  // Round to 2 decimal places
  const rounded = Math.round(millions * 100) / 100;

  // If it's a whole number, show without decimals (e.g., "1M")
  if (rounded % 1 === 0) {
    return `${rounded}M`;
  }

  // Check if rounding to 1 decimal is sufficient
  const oneDecimal = Math.round(millions * 10) / 10;
  const twoDecimal = rounded;

  // If 1 decimal rounding gives same result, use 1 decimal (e.g., "1.2M")
  // Otherwise use 2 decimals (e.g., "1.21M")
  if (Math.abs(oneDecimal - twoDecimal) < 0.001) {
    return `${oneDecimal.toFixed(1)}M`;
  }

  return `${twoDecimal.toFixed(2)}M`;
};
