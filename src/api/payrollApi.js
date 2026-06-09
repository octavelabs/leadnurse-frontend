import api from './axios';

export const getPayrollReports = (params) => api.get('/payroll', { params });
export const getPayrollReport = (id) => api.get(`/payroll/${id}`);
export const createPayrollReport = (data) => api.post('/payroll', data);
export const updatePayrollStatus = (id, status) => api.patch(`/payroll/${id}/status`, { status });
export const getMyEarnings = () => api.get('/payroll/my');
