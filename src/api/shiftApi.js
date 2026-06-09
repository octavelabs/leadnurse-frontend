import api from './axios';

export const getShifts = (params) => api.get('/shifts', { params });
export const getShift = (id) => api.get(`/shifts/${id}`);
export const createShift = (data) => api.post('/shifts', data);
export const updateShift = (id, data) => api.put(`/shifts/${id}`, data);
export const deleteShift = (id) => api.delete(`/shifts/${id}`);
export const assignWorker = (data) => api.post('/shifts/assign', data);
export const unassignWorker = (id) => api.delete(`/shifts/assign/${id}`);
export const getMyShifts = (params) => api.get('/shifts/my', { params });
export const getAvailableShifts = (params) => api.get('/shifts/available', { params });
export const applyForShift = (shiftId) => api.post(`/shifts/${shiftId}/apply`);
export const reviewApplication = (assignmentId, action) => api.patch(`/shifts/assign/${assignmentId}/review`, { action });
