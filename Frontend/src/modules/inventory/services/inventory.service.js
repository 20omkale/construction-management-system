// src/modules/inventory/services/inventory.service.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const INVENTORY_API = `${BASE_URL}/api/v1/inventory`;
const PO_API = `${BASE_URL}/api/v1/purchase-orders`;
const SUPPLIER_API = `${BASE_URL}/api/v1/suppliers`;

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// ==========================================
// GLOBAL INVENTORY DASHBOARD
// ==========================================
export const getGlobalInventoryAPI = async (page = 1, limit = 20, search = '') => {
    try {
        let url = `${INVENTORY_API}/global?page=${page}&limit=${limit}`;
        if (search) url += `&search=${search}`;
        const response = await axios.get(url, getHeaders());
        return response.data; 
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server connection error' };
    }
};

// ==========================================
// PROJECT SPECIFIC INVENTORY
// ==========================================
export const getProjectInventoryAPI = async (projectId, search = '') => {
    try {
        // Perfectly matched to your backend: /api/inventory/project/:projectId
        let url = `${INVENTORY_API}/project/${projectId}`;
        if (search) url += `?search=${search}`;
        const response = await axios.get(url, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch project inventory' };
    }
};

// ==========================================
// MATERIALS & EQUIPMENTS LISTS
// ==========================================
export const getMaterialsAPI = async (search = '') => {
    try {
        let url = `${INVENTORY_API}/materials`;
        if (search) url += `?search=${search}`;
        const response = await axios.get(url, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch materials' };
    }
};

export const getEquipmentsAPI = async (search = '') => {
    try {
        let url = `${INVENTORY_API}/equipment`;
        if (search) url += `?search=${search}`;
        const response = await axios.get(url, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch equipment' };
    }
};

// ==========================================
// SUPPLIERS
// ==========================================
export const getAllSuppliersAPI = async () => {
    try {
        const response = await axios.get(`${SUPPLIER_API}`, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch suppliers' };
    }
};

// ==========================================
// CREATE MATERIALS & EQUIPMENTS
// ==========================================
export const createMaterialAPI = async (data) => {
    try {
        const response = await axios.post(`${INVENTORY_API}/materials`, data, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to create material' };
    }
};

export const createEquipmentAPI = async (data) => {
    try {
        const response = await axios.post(`${INVENTORY_API}/equipment`, data, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to add equipment' };
    }
};

// ==========================================
// PURCHASE ORDERS & GRN
// ==========================================
export const getAllPurchaseOrdersAPI = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams({ page: params.page || 1, limit: params.limit || 20 });
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.fromDate) queryParams.append('fromDate', params.fromDate);
        if (params.toDate) queryParams.append('toDate', params.toDate);

        const response = await axios.get(`${PO_API}/?${queryParams.toString()}`, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch POs' };
    }
};

export const createPurchaseOrderAPI = async (data) => {
    try {
        const response = await axios.post(`${PO_API}/`, data, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to create PO' };
    }
};

export const createGRNAPI = async (data) => {
    try {
        const response = await axios.post(`${PO_API}/goods-receipts`, data, getHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to create GRN' };
    }
};

// ==========================================
// EXPORTS
// ==========================================
export const inventoryService = {
    getGlobalInventoryAPI,
    getProjectInventoryAPI,
    getMaterialsAPI,
    getEquipmentsAPI,
    getAllSuppliersAPI,
    createMaterialAPI,
    createEquipmentAPI,
    getAllPurchaseOrdersAPI,
    createPurchaseOrderAPI,
    createGRNAPI
};

export default inventoryService;