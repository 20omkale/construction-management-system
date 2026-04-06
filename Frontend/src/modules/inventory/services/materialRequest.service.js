// src/modules/inventory/services/materialRequest.service.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const REQUEST_API = `${BASE_URL}/api/v1/material-requests`;

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const getMaterialRequestsAPI = async (page = 1, limit = 20, status = '') => {
    try {
        let url = `${REQUEST_API}?page=${page}&limit=${limit}`;
        if (status && status !== 'ALL') url += `&status=${status}`;
        const response = await axios.get(url, getHeaders());
        return response.data; 
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server connection error' };
    }
};

export const getMaterialRequestByIdAPI = async (id) => {
    try {
        const response = await axios.get(`${REQUEST_API}/${id}`, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch request details' };
    }
};

// ADDED: Create Material Request
export const createMaterialRequestAPI = async (data) => {
    try {
        const response = await axios.post(REQUEST_API, data, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to create material request' };
    }
};

export const updateMaterialRequestStatusAPI = async (id, data) => {
    try {
        const response = await axios.patch(`${REQUEST_API}/${id}/status`, data, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to update status' };
    }
};

export const materialRequestService = {
    getMaterialRequestsAPI,
    getMaterialRequestByIdAPI,
    createMaterialRequestAPI, // <-- ADDED HERE
    updateMaterialRequestStatusAPI
};

export default materialRequestService;