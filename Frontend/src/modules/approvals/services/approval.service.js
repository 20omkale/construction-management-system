import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const approvalService = {
    // Fetch & Aggregate pending/approved/rejected items
    getApprovals: async (statusTab) => {
        try {
            // 🚨 FIX: If statusTab is empty (History mode), don't send a status param 
            // so the backend returns all records for us to filter.
            const queryParam = statusTab ? `?status=${statusTab.toUpperCase()}` : '';

            // Fetch from both budget and timeline routes concurrently
            const [budgetsRes, timelinesRes] = await Promise.allSettled([
                axios.get(`${BASE_URL}/api/v1/budgets${queryParam}`, getHeaders()),
                axios.get(`${BASE_URL}/api/v1/timelines${queryParam}`, getHeaders())
            ]);

            let aggregatedList = [];

            // Parse Budgets
            if (budgetsRes.status === 'fulfilled' && budgetsRes.value.data) {
                const budgets = budgetsRes.value.data.data || budgetsRes.value.data || [];
                aggregatedList.push(...budgets.map(b => ({
                    ...b,
                    approvalType: 'Budget',
                    displayId: `BUD-${b._id?.substring(0, 6).toUpperCase() || 'TEMP'}`,
                    submitterName: b.createdBy?.name || b.submittedBy || 'Manager',
                    displayDate: b.createdAt
                })));
            }

            // Parse Timelines
            if (timelinesRes.status === 'fulfilled' && timelinesRes.value.data) {
                const timelines = timelinesRes.value.data.data || timelinesRes.value.data || [];
                aggregatedList.push(...timelines.map(t => ({
                    ...t,
                    approvalType: 'Timeline',
                    displayId: `TML-${t._id?.substring(0, 6).toUpperCase() || 'TEMP'}`,
                    submitterName: t.createdBy?.name || t.submittedBy || 'Manager',
                    displayDate: t.createdAt
                })));
            }

            // Sort newest first
            return aggregatedList.sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));

        } catch (error) {
            console.error("Error fetching aggregated approvals:", error);
            throw error;
        }
    },

    // Process Approval/Rejection based on item type
    updateStatus: async (type, id, status, remarks) => {
        try {
            let endpoint = '';
            let payload = {};

            // Normalize type to match your if/else checks
            const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

            if (normalizedType === 'Budget') {
                endpoint = `${BASE_URL}/api/v1/budgets/${id}/status`;
                payload = { status: status.toUpperCase(), remarks };
            } else if (normalizedType === 'Timeline') {
                endpoint = `${BASE_URL}/api/v1/timelines/${id}/status`;
                // 🚨 Timelines use 'comments' key as per your requirement
                payload = { status: status.toUpperCase(), comments: remarks }; 
            }

            const response = await axios.patch(endpoint, payload, getHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error updating ${type} status:`, error);
            throw error;
        }
    }
};