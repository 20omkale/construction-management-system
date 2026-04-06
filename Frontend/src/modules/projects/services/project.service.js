// src/modules/projects/services/project.service.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const PROJECT_API = `${BASE_URL}/api/v1/projects`;

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const getAllProjectsAPI = async (page = 1, limit = 20, search = '') => {
    try {
        const response = await axios.get(`${PROJECT_API}?page=${page}&limit=${limit}&search=${search}`, getHeaders());
        return response.data; // Expected: { success: true, data: [...], pagination }
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch projects' };
    }
};

export const createProjectAPI = async (data) => {
    try {
        const response = await axios.post(`${PROJECT_API}`, data, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to create project' };
    }
};

const projectService = { getAllProjectsAPI, createProjectAPI };
export default projectService;