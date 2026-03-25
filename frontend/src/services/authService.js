import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async ({ email, password }) => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data;
};

export default apiClient;
