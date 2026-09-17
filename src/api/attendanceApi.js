import api from './axios';

export const getAttendance = (params) => api.get('/attendance', { params });
export const checkIn = (shiftId) => api.post('/attendance/checkin', { shiftId });
export const checkOut = (shiftId, signatureName, confirmedBy) => api.post('/attendance/checkout', { shiftId, signatureName, confirmedBy });
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const getMyAttendance = (params) => api.get('/attendance/my', { params });
