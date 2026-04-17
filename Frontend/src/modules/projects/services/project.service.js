import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const PROJECT_API = `${BASE_URL}/api/v1/projects`;
const DPR_API = `${BASE_URL}/api/v1/dpr`;
const WPR_API = `${BASE_URL}/api/v1/wpr`;

const getHeaders = (isFormData = false) => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
        }
    };
};

// ==================== PROJECT API ====================
export const getAllProjectsAPI = async (page = 1, limit = 20, search = '') => {
    try {
        const response = await axios.get(`${PROJECT_API}?page=${page}&limit=${limit}&search=${search}`, getHeaders());
        return response.data;
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

// ==================== DPR API ====================
export const createDPR = async (data) => {
    try {
        const response = await axios.post(`${DPR_API}`, data, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to create DPR' };
    }
};

export const getDPRsByProject = async (projectId, params = {}) => {
    try {
        const { page = 1, limit = 10, status = '' } = params;
        const response = await axios.get(`${DPR_API}/project/${projectId}?page=${page}&limit=${limit}&status=${status}`, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch DPRs' };
    }
};

// 🚨 DPR Photo Upload (Uses FormData because backend uses upload.single('file'))
export const uploadDPRPhoto = async (formData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/v1/dpr-photos/upload`, formData, getHeaders(true));
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to upload photo' };
    }
};

// ==================== WPR API ====================

// 🚨 JSON Request (Matches backend controller's req.body structure)
export const createWPR = async (wprData) => {
    try {
        const response = await axios.post(`${WPR_API}`, wprData, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to save WPR' };
    }
};

export const getWeeklyReportPreview = async (projectId, weekDate) => {
    try {
        const response = await axios.get(`${WPR_API}?projectId=${projectId}&weekDate=${weekDate}`, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to generate preview' };
    }
};

export const getSavedWPRs = async (projectId) => {
    try {
        const response = await axios.get(`${WPR_API}/list?projectId=${projectId}`, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch saved WPRs' };
    }
};

export const getProjectInventory = async (projectId) => {
    try {
        const response = await axios.get(`${WPR_API.replace('/wpr', '/inventory')}/project/${projectId}`, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch inventory' };
    }
};

const projectService = { 
    getAllProjectsAPI, 
    createProjectAPI,
    createDPR,
    getDPRsByProject,
    uploadDPRPhoto,
    createWPR,
    getWeeklyReportPreview,
    getSavedWPRs,
    getProjectInventory
};

export default projectService;