/**
 * Date and Time utility functions
 * Common functions for formatting and manipulating dates
 */

/**
 * Format date to YYYY-MM-DD HH:mm:ss format (ISO-like)
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string in YYYY-MM-DD HH:mm:ss format
 */
export const formatDateTimeISO = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const year = dateObj.getFullYear();
  const month = pad(dateObj.getMonth() + 1);
  const day = pad(dateObj.getDate());
  const hours = pad(dateObj.getHours());
  const minutes = pad(dateObj.getMinutes());
  const seconds = pad(dateObj.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Format date to DD-MM-YYYY HH:MM:SS AM/PM format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const day = pad(dateObj.getDate());
  const month = pad(dateObj.getMonth() + 1);
  const year = dateObj.getFullYear();
  let hours = dateObj.getHours();
  const minutes = pad(dateObj.getMinutes());
  const seconds = pad(dateObj.getSeconds());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = pad(hours);

  return `${day}-${month}-${year} ${hh}:${minutes}:${seconds} ${ampm}`;
};

/**
 * Format date to DD-MM-YYYY format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const day = pad(dateObj.getDate());
  const month = pad(dateObj.getMonth() + 1);
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Format time to HH:MM AM/PM format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  let hours = dateObj.getHours();
  const minutes = pad(dateObj.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = pad(hours);

  return `${hh}:${minutes} ${ampm}`;
};

/**
 * Format time to HH:MM:SS AM/PM format with seconds
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted time string with seconds
 */
export const formatTimeWithSeconds = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  let hours = dateObj.getHours();
  const minutes = pad(dateObj.getMinutes());
  const seconds = pad(dateObj.getSeconds());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = pad(hours);

  return `${hh}:${minutes}:${seconds} ${ampm}`;
};

/**
 * Format date and time to DD-MM-YYYY HH:MM:SS AM/PM format with seconds
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date and time string with seconds
 */
export const formatDateTimeWithSeconds = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const day = pad(dateObj.getDate());
  const month = pad(dateObj.getMonth() + 1);
  const year = dateObj.getFullYear();
  const hours = pad(dateObj.getHours()); // 24-hour format
  const minutes = pad(dateObj.getMinutes());
  const seconds = pad(dateObj.getSeconds());

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 * @param {Date|string} date - The date to get relative time for
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diffInMs = now - dateObj;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(dateObj);
  }
};

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is today, false otherwise
 */
export const isToday = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;

  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if a date is yesterday
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is yesterday, false otherwise
 */
export const isYesterday = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return dateObj.toDateString() === yesterday.toDateString();
};

/**
 * Get the start of the day (00:00:00)
 * @param {Date|string} date - The date to get start of day for
 * @returns {Date} Date object set to start of day
 */
export const getStartOfDay = (date) => {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Get the end of the day (23:59:59)
 * @param {Date|string} date - The date to get end of day for
 * @returns {Date} Date object set to end of day
 */
export const getEndOfDay = (date) => {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};
