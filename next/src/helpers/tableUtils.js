/**
 * Table utility functions
 * Common functions used across table components
 */

/**
 * Calculate descending serial number for table rows
 * Ensures serial numbers are always positive and in descending order
 * @param {number} index - Current row index (0-based)
 * @param {number} currentPage - Current page number (1-based)
 * @param {number} rowsPerPage - Number of rows per page
 * @param {number} totalItems - Total number of items
 * @returns {number} Calculated serial number (always >= 1)
 */
export const calculateIndex = (index, currentPage, rowsPerPage, totalItems) => {
  const calculatedIndex = totalItems - (currentPage - 1) * rowsPerPage - index;
  return Math.max(1, calculatedIndex);
};
