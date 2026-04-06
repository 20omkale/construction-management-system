// src/modules/auth/services/auth.service.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
const AUTH_API = `${BASE_URL}/api/v1/auth`;

export const loginAPI = async (identifier, password) => {
    try {
        const response = await axios.post(`${AUTH_API}/login`, { identifier, password });
        return response.data; 
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server connection error' };
    }
};

export const sendOtpAPI = async (identifier) => {
    try {
        const response = await axios.post(`${AUTH_API}/login-with-otp`, { identifier });
        return response.data; 
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to send OTP' };
    }
};

// FIXED: Renamed to verifyOtpAPI to match your AuthProvider.jsx import exactly
export const verifyOtpAPI = async (identifier, otp) => {
    try {
        const response = await axios.post(`${AUTH_API}/verify-otp-login`, { identifier, otp });
        return response.data; 
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Invalid OTP' };
    }
};

const authService = { loginAPI, sendOtpAPI, verifyOtpAPI };
export default authService;