import api from '../../../shared/utils/api';

const SUPER_ADMIN_BASE = '/super-admin';

export const superAdminService = {
    getDashboardData: async () => {
        const response = await api.get(`${SUPER_ADMIN_BASE}/dashboard`);
        return response.data;
    },
    getDashboardStats: async () => {
        const response = await api.get(`${SUPER_ADMIN_BASE}/dashboard/stats`);
        return response.data;
    },
    getRecentActivities: async () => {
        const response = await api.get(`${SUPER_ADMIN_BASE}/dashboard/recent-activities`);
        return response.data;
    },
    getAllCompanies: async (params) => {
        const response = await api.get(`${SUPER_ADMIN_BASE}/companies`, { params });
        return response.data;
    },
    getCompanyDetails: async (companyId) => {
        const response = await api.get(`${SUPER_ADMIN_BASE}/companies/${companyId}`);
        return response.data;
    },
    updateCompanyStatus: async (companyId, status) => {
        const response = await api.patch(`${SUPER_ADMIN_BASE}/companies/${companyId}/status`, { status });
        return response.data;
    }
};
