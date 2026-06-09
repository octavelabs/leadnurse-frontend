import api from './axios';

// Admin
export const getAllDocuments = () => api.get('/documents');
export const uploadDocument = (formData) => api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const assignDocument = (id, userIds) => api.post(`/documents/${id}/assign`, { userIds });
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// Employee
export const getMyDocuments = () => api.get('/documents/my');
export const signDocument = (sigId, signatureText) => api.post(`/documents/sign/${sigId}`, { signatureText });
export const declineDocument = (sigId) => api.post(`/documents/decline/${sigId}`);
