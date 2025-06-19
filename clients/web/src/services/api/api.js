import axios from 'axios';

const api = axios.create({
  baseURL: 'http://buildflow.api',
  withCredentials: true,
});

export default api;