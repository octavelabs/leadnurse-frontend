import api from './axios';

export const getCourses = (search) => api.get('/courses', { params: search ? { search } : {} });
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const getAdminStats = () => api.get('/courses/admin/stats');
