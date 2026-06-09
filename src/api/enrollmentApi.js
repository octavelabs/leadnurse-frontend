import api from './axios';

export const getMyEnrollments = () => api.get('/enrollments/my');
export const enrollInCourse = (courseId) => api.post('/enrollments', { courseId });
export const unenrollFromCourse = (courseId) => api.delete(`/enrollments/${courseId}`);
