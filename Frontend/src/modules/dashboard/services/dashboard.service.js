// src/modules/dashboard/services/dashboard.service.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const DASHBOARD_API = `${BASE_URL}/api/v1/dashboard`;

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const getAdminDashboardAPI = async (companyId = '') => {
    try {
        // If Super Admin selects a specific company, we pass it as a query param
        const url = companyId ? `${DASHBOARD_API}/?companyId=${companyId}` : `${DASHBOARD_API}/`;
        const response = await axios.get(url, getHeaders());
        return response.data; // Expected: { success: true, data: { quickActions, recentActivity } }
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server connection error' };
    }
};