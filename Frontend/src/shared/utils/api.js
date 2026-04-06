import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Auth Token and Company ID
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        const companyId = localStorage.getItem('companyId');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (companyId) {
            config.headers['X-Company-ID'] = companyId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle Logout on Unauthorized
            localStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
