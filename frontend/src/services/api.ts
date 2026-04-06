import axios from 'axios';
import Cookies from 'js-cookie';

// Bypassing Next.js build cache by hardcoding the exact Production Backend URL
const api = axios.create({
  // DİKKAT: Buradaki adresi kendi gerçek backend domainin ile değiştirdiğinden emin ol!
  baseURL: 'https://marketing-sales-hub-production.up.railway.app/api/v1', 
});

// Request Interceptor: Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;