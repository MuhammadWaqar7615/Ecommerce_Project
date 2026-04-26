import api from './api';
import { handleResponse, handleError } from '../utils/apiResponse';

export const sendResetOTP = async (email) => {
  try {
    const response = await api.post('/password/send-otp', { email });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post('/password/verify-otp', { email, otp });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await api.post('/password/reset-password', { email, otp, newPassword });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const resendOTP = async (email) => {
  try {
    const response = await api.post('/password/resend-otp', { email });
    return handleResponse(response);
  } catch (error) {
    throw new Error(handleError(error));
  }
};