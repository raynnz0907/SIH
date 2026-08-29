import axios from 'axios';
import { useAthleteStore } from '../store/athleteStore';

const apiClient = axios.create({
  baseURL: '/api',
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config) => {
  const token = useAthleteStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAthleteStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data).then(res => res.data),
  login: (data) => apiClient.post('/auth/login', data).then(res => res.data),
  getMe: () => apiClient.get('/auth/me').then(res => res.data),
};

export const intakeAPI = {
  getSports: () => apiClient.get('/intake/sports').then(res => res.data),
  submitProfile: (data) => apiClient.post('/intake/profile', data).then(res => res.data),
  getProfile: () => apiClient.get('/intake/profile').then(res => res.data),
};

export const videoAPI = {
  uploadVideo: (formData) => apiClient.post('/video/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  getStatus: (id) => apiClient.get(`/video/${id}/status`).then(res => res.data),
};

export const assessmentAPI = {
  submitManual: (data) => apiClient.post('/assessment/manual', data).then(res => res.data),
  getLatest: () => apiClient.get('/assessment/latest').then(res => res.data),
};

export const planAPI = {
  getCurrent: () => apiClient.get('/plan/current').then(res => res.data),
  generate: () => apiClient.post('/plan/generate').then(res => res.data),
  getHistory: () => apiClient.get('/plan/history').then(res => res.data),
};

export const progressAPI = {
  logSession: (data) => apiClient.post('/progress/log', data).then(res => res.data),
  getDashboard: () => apiClient.get('/progress/dashboard').then(res => res.data),
  getLogs: () => apiClient.get('/progress/logs').then(res => res.data),
};

export default apiClient;
