// src/modules/projects/services/dpr.service.js
import api from '../../../shared/utils/api'; 

export const dprService = {
  // ==========================================
  // DPR CORE
  // ==========================================
  createDPR: async (dprData) => {
    const response = await api.post('/dpr', dprData);
    return response.data;
  },

  getDPRsByProject: async (projectId, params = {}) => {
    const response = await api.get(`/dpr/project/${projectId}`, { params });
    return response.data;
  },

  getDPRById: async (id) => {
    const response = await api.get(`/dpr/${id}`);
    return response.data;
  },

  updateDPR: async (id, updateData) => {
    const response = await api.put(`/dpr/${id}`, updateData);
    return response.data;
  },

  // ==========================================
  // MEDIA UPLOADS (Two-Step Flow)
  // ==========================================
  uploadDPRPhoto: async (dprId, file, title = '', description = '') => {
    const formData = new FormData();
    formData.append('dprId', dprId);
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    const response = await api.post('/dpr-photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ==========================================
  // WPR CORE
  // ==========================================
  getWeeklyReport: async (projectId, weekDate) => {
    const response = await api.get('/wpr', { params: { projectId, weekDate } });
    return response.data;
  },

  createWPR: async (wprData) => {
    const response = await api.post('/wpr', wprData);
    return response.data;
  },

  // ==========================================
  // DROPDOWN DEPENDENCIES & PRE-FILL DATA
  // ==========================================
  getAttendanceSummary: async (projectId, date) => {
    const response = await api.get('/attendance/by-date', { params: { projectId, date } });
    return response.data;
  },

  getProjectTasks: async (projectId) => {
    const response = await api.get('/tasks', { params: { projectId, limit: 100 } });
    return response.data;
  },

  getProjectMaterials: async (projectId) => {
    const response = await api.get(`/inventory/project/${projectId}`, { params: { limit: 100 } });
    return response.data;
  },

  getProjectEquipment: async (projectId) => {
    const response = await api.get('/inventory/equipment', { params: { projectId, location: 'PROJECT', limit: 100 } });
    return response.data;
  },

  getProjectSubcontractors: async (projectId) => {
    const response = await api.get(`/subcontractors/projects/all`, { params: { projectId, limit: 100 } });
    return response.data;
  }
};