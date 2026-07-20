import api from './axios';

export const getMyUploadedCertificates = () => api.get('/uploaded-certificates/mine');

export const uploadCertificate = (formData) =>
  api.post('/uploaded-certificates/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteUploadedCertificate = (id) => api.delete(`/uploaded-certificates/${id}`);

export const getWorkerCertificates = (userId) =>
  api.get(`/uploaded-certificates/worker/${userId}`);
