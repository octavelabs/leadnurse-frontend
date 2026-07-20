import api from './axios';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);
export const resendVerification = (email) => api.post('/auth/resend-verification', { email });

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, data) => api.post(`/auth/reset-password/${token}`, data);

export const changePassword = (data) => api.put('/auth/change-password', data);

export const toggleUserActive = (userId) => api.patch(`/auth/admin/users/${userId}/toggle-active`);
