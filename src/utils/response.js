/**
 * Standard response utilities following error handling guidelines
 * @author HatchBot Framework
 */

/**
 * Create a success response
 * @param {any} data - The data to return
 * @returns {{ success: boolean, error: null, data: any }}
 */
function success(data = null) {
  return { 
    success: true, 
    error: null, 
    data 
  };
}

/**
 * Create a failure response
 * @param {string|Error} message - The error message
 * @param {any} data - Optional data to include
 * @returns {{ success: boolean, error: string, data: any }}
 */
function failure(message = 'Unknown error', data = null) {
  return { 
    success: false, 
    error: typeof message === 'string' ? message : message.message, 
    data 
  };
}

/**
 * Wrap an async function with error handling
 * @param {Function} fn - The function to wrap
 * @returns {Function} - The wrapped function
 */
function withErrorHandling(fn) {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return success(result);
    } catch (error) {
      console.error('❌ Error in wrapped function:', error);
      return failure(error);
    }
  };
}

module.exports = {
  success,
  failure,
  withErrorHandling
};
