// src/modules/inventory/services/inventory.service.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'; 

// Mapped exactly to your index.js routes
const INVENTORY_URL = `${API_URL}/api/v1/inventory`; 
const REQUEST_URL = `${API_URL}/api/v1/material-requests`; 
const PO_URL = `${API_URL}/api/v1/purchase-orders`;

const getHeaders = () => {
  const token = localStorage.getItem('accessToken'); // <--- CORRECT KEY
  return {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  };
};

export const inventoryService = {
  // =====================================
  // EQUIPMENT & GLOBAL INVENTORY
  // =====================================
  getGlobalInventory: async (params) => (await axios.get(`${INVENTORY_URL}/global`, { params, ...getHeaders() })).data,
  getAllEquipment: async (params) => (await axios.get(`${INVENTORY_URL}/equipment`, { params, ...getHeaders() })).data,
  getEquipmentById: async (id) => (await axios.get(`${INVENTORY_URL}/equipment/${id}`, getHeaders())).data,
  createEquipment: async (data) => (await axios.post(`${INVENTORY_URL}/equipment`, data, getHeaders())).data,
  updateEquipment: async (id, data) => (await axios.patch(`${INVENTORY_URL}/equipment/${id}`, data, getHeaders())).data,
  deleteEquipment: async (id) => (await axios.delete(`${INVENTORY_URL}/equipment/${id}`, getHeaders())).data,
  transferItem: async (payload) => (await axios.post(`${INVENTORY_URL}/transfers`, payload, getHeaders())).data,

  // =====================================
  // MATERIALS MASTER
  // =====================================
  getAllMaterials: async () => (await axios.get(`${INVENTORY_URL}/materials`, getHeaders())).data,
  getMaterialById: async (id) => (await axios.get(`${INVENTORY_URL}/materials/${id}`, getHeaders())).data,
  createMaterial: async (data) => (await axios.post(`${INVENTORY_URL}/materials`, data, getHeaders())).data,
  updateMaterial: async (id, data) => (await axios.patch(`${INVENTORY_URL}/materials/${id}`, data, getHeaders())).data, 
  deleteMaterial: async (id) => (await axios.delete(`${INVENTORY_URL}/materials/${id}`, getHeaders())).data,

  // =====================================
  // MATERIAL REQUESTS
  // =====================================
  requestItem: async (payload) => (await axios.post(REQUEST_URL, payload, getHeaders())).data,
  getAllMaterialRequests: async (params) => (await axios.get(REQUEST_URL, { params, ...getHeaders() })).data,
  getMaterialRequestById: async (id) => (await axios.get(`${REQUEST_URL}/${id}`, getHeaders())).data,
  updateMaterialRequestStatus: async (id, data) => (await axios.patch(`${REQUEST_URL}/${id}/status`, data, getHeaders())).data,
  fulfillRequestFromStock: async (payload) => (await axios.post(`${REQUEST_URL}/fulfill-transfer`, payload, getHeaders())).data,

  // =====================================
  // PURCHASE ORDERS & GRN
  // =====================================
  getAllPurchaseOrders: async () => (await axios.get(PO_URL, getHeaders())).data,
  createPurchaseOrder: async (data) => (await axios.post(PO_URL, data, getHeaders())).data,
  createGRN: async (data) => (await axios.post(`${PO_URL}/goods-receipts`, data, getHeaders())).data,

  // =====================================
  // REPORTS & DASHBOARD
  // =====================================
  getInventoryValuation: async () => (await axios.get(`${INVENTORY_URL}/reports/valuation`, getHeaders())).data,
  getLowStockReport: async (params) => (await axios.get(`${INVENTORY_URL}/reports/low-stock`, { params, ...getHeaders() })).data,
  getStockMovementReport: async (params) => (await axios.get(`${INVENTORY_URL}/reports/movement`, { params, ...getHeaders() })).data
};