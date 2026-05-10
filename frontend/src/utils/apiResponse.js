export const handleResponse = (response) => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message);
  }
};

export const handleError = (error) => {
  if (error.response) {
    const data = error.response.data || {};
    if (data.message) {
      return data.message;
    }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((errItem) => errItem.msg || errItem.message)
        .filter(Boolean)
        .join(', ');
    }
    return 'Server error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};