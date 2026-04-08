import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const USER_API = `${BASE_URL}/api/v1/users`;

// 🚨 Standard JSON headers only
const getHeaders = () => ({
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json' 
    }
});

export const getUsersAPI = async (params = { page: 1, limit: 50, includeProjects: true }) => {
    try {
        const response = await axios.get(USER_API, { params, ...getHeaders() });
        return response.data;
    } catch (error) { throw error.response?.data; }
};

// 🚨 Reverted back to expecting a standard JSON payload
export const createUserAPI = async (payload) => {
    try {
        const response = await axios.post(USER_API, payload, getHeaders());
        return response.data;
    } catch (error) { throw error.response?.data; }
};

export const toggleUserStatusAPI = async (id, isActive) => {
    try {
        const response = await axios.patch(`${USER_API}/${id}/status`, { isActive, reason: 'Admin toggle' }, getHeaders());
        return response.data;
    } catch (error) { throw error.response?.data; }
};

export const deleteUserAPI = async (id) => {
    try {
        const response = await axios.delete(`${USER_API}/${id}`, getHeaders());
        return response.data;
    } catch (error) { throw error.response?.data; }
};