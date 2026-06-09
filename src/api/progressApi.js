import api from './axios';

export const getCourseProgress = (courseId) => api.get(`/progress/course/${courseId}`);
export const markLessonComplete = (lessonId) => api.post('/progress/complete', { lessonId });
