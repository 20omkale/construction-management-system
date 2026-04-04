// src/modules/projects/services/project.service.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'; 
const BASE_URL = `${API_URL}/api/projects`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const projectService = {
  getAllProjects: async () => {
    const response = await axios.get(`${BASE_URL}`, getHeaders());
    return response.data;
  },
  getProjectById: async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`, getHeaders());
    return response.data;
  },
  createProject: async (data) => {
    const response = await axios.post(`${BASE_URL}`, data, getHeaders());
    return response.data;
  }
};