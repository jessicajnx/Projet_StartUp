import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  getAll: () => api.get('/users/'),
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  getByVille: (ville: string) => api.get(`/users/ville/${ville}`),
};

export const livreAPI = {
  create: (data: any) => api.post('/livres/', data),
  getAll: () => api.get('/livres/'),
  getById: (id: number) => api.get(`/livres/${id}`),
  update: (id: number, data: any) => api.put(`/livres/${id}`, data),
  delete: (id: number) => api.delete(`/livres/${id}`),
  search: (query: string) => api.get(`/livres/search/${query}`),
  assignToUser: (livreId: number, userId: number) => api.post(`/livres/${livreId}/assign/${userId}`),
  unassignFromUser: (livreId: number, userId: number) => api.delete(`/livres/${livreId}/unassign/${userId}`),
};

export const empruntAPI = {
  create: (data: any) => api.post('/emprunts/', data),
  getAll: () => api.get('/emprunts/'),
  getById: (id: number) => api.get(`/emprunts/${id}`),
  getByUser: (userId: number) => api.get(`/emprunts/user/${userId}`),
  delete: (id: number) => api.delete(`/emprunts/${id}`),
  getByEmprunteur: (userId: number) => api.get(`/emprunts/emprunteur/${userId}`),
  getByEmprunter: (userId: number) => api.get(`/emprunts/emprunter/${userId}`),
};

export default api;
