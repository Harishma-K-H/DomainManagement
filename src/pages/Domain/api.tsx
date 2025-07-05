// src/api.tsx
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all domains
export const fetchDomains = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/domains`);
  return Array.isArray(response.data) ? response.data : response.data.domains;
};
