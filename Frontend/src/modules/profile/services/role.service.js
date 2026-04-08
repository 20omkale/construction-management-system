import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const ROLE_API = `${BASE_URL}/api/v1/roles`;

const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
});

export const getRolesAPI = async (params = { page: 1, limit: 50 }) => {
    try {
        const response = await axios.get(ROLE_API, { params, ...getHeaders() });
        return response.data;
    } catch (error) { throw error.response?.data; }
};

export const createRoleAPI = async (payload) => {
    try {
        const response = await axios.post(ROLE_API, payload, getHeaders());
        return response.data;
    } catch (error) { throw error.response?.data; }
};

// 🚨 NEW: Added Delete Role API
export const deleteRoleAPI = async (id) => {
    try {
        const response = await axios.delete(`${ROLE_API}/${id}`, getHeaders());
        return response.data;
    } catch (error) { throw error.response?.data; }
};