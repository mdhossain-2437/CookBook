import axios from 'axios';
import { toast } from 'react-toastify';

// Create an axios instance with base URL from environment variables
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('access-token');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Check if it's a session timeout
      if (error.response.data && error.response.data.sessionExpired) {
        toast.error('Your session has expired. Please login again.');
        
        // Clear token and redirect to login only for session expiration
        localStorage.removeItem('access-token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        // For other 401 errors, just show a toast but don't redirect
        // This allows the component to handle the error
        toast.error('Authentication error. Please try logging in again.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
