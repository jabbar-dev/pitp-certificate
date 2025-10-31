import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Students
export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Subjects
export const subjectService = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`)
};

// Exams
export const examService = {
  getAll: (params) => api.get('/exams', { params }),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`)
};

// Answer Sheets
export const answerSheetService = {
  generate: (data) => api.post('/answer-sheets/generate', data),
  getByExam: (examId) => api.get(`/answer-sheets/${examId}`)
};

// Rubrics
export const rubricService = {
  getByExam: (examId) => api.get(`/rubrics/${examId}`),
  create: (data) => api.post('/rubrics', data),
  delete: (id) => api.delete(`/rubrics/${id}`)
};

// Marking
export const markingService = {
  getTasks: () => api.get('/marking/tasks'),
  submit: (data) => api.post('/marking/submit', data),
  getStudentMarks: (examId, studentId) => api.get(`/marking/exam/${examId}/student/${studentId}`)
};

// Results
export const resultService = {
  getByExam: (examId) => api.get(`/results/${examId}`),
  finalize: (examId) => api.post(`/results/finalize/${examId}`),
  exportCSV: (examId) => api.get(`/results/export/${examId}/csv`, { responseType: 'blob' })
};

// Scans
export const scanService = {
  upload: (examId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', examId);
    return api.post('/scans/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getByExam: (examId) => api.get(`/scans/${examId}`),
  getStatus: (scanId) => api.get(`/scans/status/${scanId}`)
};

// Teachers
export const teacherService = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`)
};

export default api;
