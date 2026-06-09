import api from './axios';

export const getAllCompliance = (params) => api.get('/compliance', { params });
export const getWorkerCompliance = (userId) => api.get(`/compliance/worker/${userId}`);
export const upsertCompliance = (data) => api.post('/compliance', data);
export const getMyCompliance = () => api.get('/compliance/my');
export const getExpiringCompliance = () => api.get('/compliance/expiring');
export const uploadComplianceDocument = (id, file) => {
  const form = new FormData();
  form.append('document', file);
  return api.post(`/compliance/${id}/document`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const submitMyComplianceDocument = (type, file) => {
  const form = new FormData();
  form.append('type', type);
  form.append('document', file);
  return api.post('/compliance/my/document', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
