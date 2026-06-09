import api from './axios';

export const getSlidesByLesson = (lessonId) => api.get(`/slides/lesson/${lessonId}`);
export const createSlide = (data) => api.post('/slides', data);
export const updateSlide = (id, data) => api.put(`/slides/${id}`, data);
export const deleteSlide = (id) => api.delete(`/slides/${id}`);
