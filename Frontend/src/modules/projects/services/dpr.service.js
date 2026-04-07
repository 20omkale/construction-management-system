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
    // 🚨 CRITICAL FIX: Uses the global '/dpr' route with projectId as a query param to bypass 400 Bad Request
    const queryParams = {
      projectId: projectId,
      page: params.page || 1,
      limit: params.limit || 100,
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      ...(params.status && { status: params.status })
    };

    const response = await api.get('/dpr', { params: queryParams });
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

  deleteDPR: async (id) => {
    const response = await api.delete(`/dpr/${id}`);
    return response.data;
  },

  // ==========================================
  // MEDIA UPLOADS
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

  // 🚨 CRITICAL FIX: Explicitly fetches the photos associated with a specific DPR
  getDPRPhotos: async (dprId) => {
    const response = await api.get(`/dpr-photos/dpr/${dprId}`);
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

  deleteWPR: async (id) => {
    const response = await api.delete(`/wpr/${id}`);
    return response.data;
  },

  // ==========================================
  // DEPENDENCIES
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