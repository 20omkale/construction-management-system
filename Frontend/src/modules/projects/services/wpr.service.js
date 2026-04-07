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

// 1. Fetches real-time aggregated data from DPRs (Matches your backend: getWeeklyProgressReport)
export const getWPRPreviewAPI = async (projectId, weekDate) => {
    try {
        // Assuming your GET route takes query params
        const response = await axios.get(`${WPR_API}`, { 
            params: { projectId, weekDate },
            ...getHeaders() 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch WPR preview' };
    }
};

// 2. Saves the finalized WPR to the database (Matches your backend: createWPR)
export const createWPRAPI = async (payload) => {
    try {
        const response = await axios.post(`${WPR_API}`, payload, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to save WPR' };
    }
};

// 3. Gets saved WPRs for the List Page
export const getProjectWPRsAPI = async (projectId) => {
    try {
        const response = await axios.get(`${WPR_API}/saved`, { 
            params: { projectId },
            ...getHeaders() 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch WPRs' };
    }
};

// 4. Updates WPR status (Approve/Submit)
export const updateWPRStatusAPI = async (id, status, approvalNotes = '') => {
    try {
        const response = await axios.patch(`${WPR_API}/${id}/status`, { status, approvalNotes }, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to update WPR status' };
    }
};