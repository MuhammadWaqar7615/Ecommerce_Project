export const handleResponse = (response) => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message);
  }
};

export const handleError = (error) => {
  if (error.response) {
    return error.response.data.message || 'Server error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};