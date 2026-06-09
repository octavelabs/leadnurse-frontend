import api from './axios';

export const getAssessmentByCourse = (courseId) => api.get(`/assessments/course/${courseId}`);
export const submitAssessment = (courseId, answers) =>
  api.post(`/assessments/course/${courseId}/submit`, { answers });
export const createAssessment = (courseId, data) => api.post(`/assessments/course/${courseId}`, data);
export const updateAssessment = (courseId, data) => api.put(`/assessments/course/${courseId}`, data);
