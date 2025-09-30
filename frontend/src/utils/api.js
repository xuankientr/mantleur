import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Tạo axios instance với config mặc định
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// User API
export const userAPI = {
  updateProfile: (userData) => api.put('/user/profile', userData),
  getUserProfile: (userId) => api.get(`/user/${userId}`),
  getUserStreams: (userId) => api.get(`/user/${userId}/streams`),
  addCoins: (amount) => api.post('/user/add-coins', { amount }),
};

// Stream API
export const streamAPI = {
  getStreams: (params = {}) => api.get('/streams', { params }),
  getStream: (streamId) => api.get(`/streams/${streamId}`),
  createStream: (streamData) => api.post('/streams', streamData),
  updateStream: (streamId, streamData) => api.put(`/streams/${streamId}`, streamData),
  deleteStream: (streamId) => api.delete(`/streams/${streamId}`),
  getUserStreams: () => api.get('/streams/user/streams'),
};

// Donation API
export const donationAPI = {
  createDonation: (donationData) => api.post('/donations', donationData),
  getUserDonations: (params = {}) => api.get('/donations/my-donations', { params }),
  getReceivedDonations: (params = {}) => api.get('/donations/received', { params }),
  getStreamDonations: (streamId, params = {}) => api.get(`/donations/stream/${streamId}`, { params }),
};

export default api;



