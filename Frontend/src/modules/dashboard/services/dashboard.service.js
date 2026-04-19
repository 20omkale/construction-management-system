import api from '../../../shared/utils/api';

export const getAdminDashboardAPI = async (companyId = '') => {
    try {
        // Because api.js automatically attaches the base URL and tokens, 
        // the request is now incredibly clean.
        const url = companyId ? `/dashboard/?companyId=${companyId}` : `/dashboard/`;
        const response = await api.get(url);
        return response.data; // Expected: { success: true, data: { ... } }
    } catch (error) {
        // The global response interceptor in api.js already handles 401 logouts,
        // so we just pass the error payload back to the component.
        throw error.response?.data || { success: false, message: 'Server connection error' };
    }
};