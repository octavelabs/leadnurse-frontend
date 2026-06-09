import api from './axios';

export const getFacilities = () => api.get('/facilities');
export const getFacility = (id) => api.get(`/facilities/${id}`);
export const createFacility = (data) => api.post('/facilities', data);
export const updateFacility = (id, data) => api.put(`/facilities/${id}`, data);
export const deleteFacility = (id) => api.delete(`/facilities/${id}`);
