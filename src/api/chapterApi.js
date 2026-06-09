import api from './axios';

// Admin
export const getChaptersByCourse = (courseId) => api.get(`/chapters/course/${courseId}`);
export const createChapter = (data) => api.post('/chapters', data);
export const updateChapter = (id, data) => api.put(`/chapters/${id}`, data);
export const deleteChapter = (id) => api.delete(`/chapters/${id}`);
export const upsertChapterQuiz = (chapterId, questions) => api.put(`/chapters/${chapterId}/quiz`, { questions });

// Employee
export const getChapterQuiz = (chapterId) => api.get(`/chapters/${chapterId}/quiz`);
export const submitChapterQuiz = (chapterId, answers) => api.post(`/chapters/${chapterId}/quiz/submit`, { answers });
