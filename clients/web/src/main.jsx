import axios from 'axios';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://buildflow.api';

createRoot(document.getElementById('root')).render(
  <App />
)
