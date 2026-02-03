/**
 * Handles API validation errors (422 status) and extracts field-specific error messages
 * @param {Object} error - The error object from axios
 * @returns {Object} Object containing general message and field-specific errors
 */
export const handleValidationErrors = (error) => {
  // Debug: log the error structure
  console.log('Error object:', error);
  console.log('Error response:', error.response);
  console.log('Error response data:', error.response?.data);

  const response = error.response;

  // Check if it's a 422 validation error
  if (response?.status === 422 && response?.data?.errors) {
    const { message, errors } = response.data;

    console.log('Validation errors found:', errors);

    // Transform the errors object to a more usable format
    const fieldErrors = {};
    Object.keys(errors).forEach((field) => {
      fieldErrors[field] = errors[field][0]; // Take the first error message for each field
    });

    return {
      isValidationError: true,
      generalMessage: message,
      fieldErrors,
      originalError: error,
    };
  }

  // Return null if it's not a validation error
  return null;
};

/**
 * Gets all validation error messages as an array for toast display
 * @param {Object} error - The error object from axios
 * @returns {Array} Array of error messages
 */
export const getValidationErrorMessages = (error) => {
  const validationError = handleValidationErrors(error);

  if (validationError && validationError.fieldErrors) {
    return Object.values(validationError.fieldErrors);
  }

  return [];
};

/**
 * Simple function to check if an error is a validation error
 * @param {Object} error - The error object from axios
 * @returns {boolean} True if it's a 422 validation error
 */
export const isValidationError = (error) => {
  return error.response?.status === 422 && error.response?.data?.errors;
};

/**
 * Debug function to inspect error structure
 * @param {Object} error - The error object from axios
 */
export const debugError = (error) => {
  console.log('=== ERROR DEBUG ===');
  console.log('Full error:', error);
  console.log('Error status:', error.response?.status);
  console.log('Error data:', error.response?.data);
  console.log('Error message:', error.message);
  console.log('Has errors property:', !!error.response?.data?.errors);
  console.log('Errors object:', error.response?.data?.errors);
  console.log('Is validation error:', isValidationError(error));
  console.log('==================');
};
