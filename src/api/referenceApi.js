import api from './axios';

// Admin
export const getWorkerReferences = (workerId) => api.get(`/references/worker/${workerId}`);
export const getAllReferences = (params) => api.get('/references', { params });
export const getReferenceSummary = () => api.get('/references/summary');
export const addReference = (data) => api.post('/references', data);
export const sendReferenceRequest = (id) => api.post(`/references/${id}/send`);
export const getReferenceResponse = (id) => api.get(`/references/${id}`);
export const deleteReference = (id) => api.delete(`/references/${id}`);

// Public (no auth token needed — axios instance must not force a token for these)
export const getPublicReferenceForm = (token) => api.get(`/references/form/${token}`);
export const submitReferenceForm = (token, data) => api.post(`/references/form/${token}/submit`, data);
