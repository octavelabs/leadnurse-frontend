import api from './axios';

export const getWorkers = (params) => api.get('/workers', { params });
export const getWorker = (id) => api.get(`/workers/${id}`);
export const getMyWorkerProfile = () => api.get('/workers/me');
export const updateMyAvailability = (availability) => api.put('/workers/me/availability', { availability });
export const updateMyProfile = (data) => api.put('/auth/profile', data);
export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return api.post('/auth/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getHealthcareRoles = () => api.get('/healthcare-roles');
export const assignWorkerRole = (data) => api.post('/healthcare-roles/workers/assign', data);
export const removeWorkerRole = (id) => api.delete(`/healthcare-roles/workers/role/${id}`);
