import axios from 'axios';

// Axios instance with base URL for API calls
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default api;

