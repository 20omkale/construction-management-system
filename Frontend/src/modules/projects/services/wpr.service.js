import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const WPR_API = `${BASE_URL}/api/v1/wpr`;

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const getWPRPreviewAPI = async (projectId, weekDate) => {
    try {
        const response = await axios.get(`${WPR_API}`, { 
            params: { projectId, weekDate },
            ...getHeaders() 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch WPR preview' };
    }
};

export const createWPRAPI = async (payload) => {
    try {
        const response = await axios.post(`${WPR_API}`, payload, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to save WPR' };
    }
};

export const getProjectWPRsAPI = async (projectId) => {
    try {
        // 🚨 FIXED: Changed from /saved to /list to match your wpr.routes.js
        const response = await axios.get(`${WPR_API}/list`, { 
            params: { projectId },
            ...getHeaders() 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch WPRs' };
    }
};

export const updateWPRStatusAPI = async (id, status, approvalNotes = '') => {
    try {
        const response = await axios.patch(`${WPR_API}/${id}/status`, { status, approvalNotes }, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to update WPR status' };
    }
};