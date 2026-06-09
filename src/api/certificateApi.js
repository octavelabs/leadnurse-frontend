import api from './axios';

export const getMyCertificates = () => api.get('/certificates/my');
export const getCertificateById = (id) => api.get(`/certificates/${id}`);
export const getCertificateByCourse = (courseId) => api.get(`/certificates/course/${courseId}`);
