import api from './axios';

// Admin
export const requestSignoff = (data) => api.post('/timesheet-signoff/request', data);
export const getSignoff = (attendanceId) => api.get(`/timesheet-signoff/${attendanceId}`);

// Public
export const getPublicSignoffForm = (token) => api.get(`/timesheet-signoff/form/${token}`);
export const submitSignoff = (token, data) => api.post(`/timesheet-signoff/form/${token}/submit`, data);
