import apiClient from '../../../api/apiClient';// Ensure this matches the exact route in your backend app.use()
const API_URL = 'http://localhost:5000/api/v1/auth';

// 1. Standard Password Login
export const loginAPI = async (identifier, password) => {
    try {
        const response = await apiClient.post(`${API_URL}/login`, { 
            identifier, 
            password 
        });

          console.log("🔥 LOGIN RESPONSE:", response.data); 
        return response.data; 
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
        throw new Error(errorMessage);
    }
};

// 2. Request OTP Code
export const sendOtpAPI = async (identifier) => {
    try {
        const response = await apiClient.post(`${API_URL}/login-with-otp`, { 
            identifier 
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to send OTP.";
        throw new Error(errorMessage);
    }
};

// 3. Verify OTP & Login
export const verifyOtpAPI = async (identifier, otp) => {
    try {
        const response = await apiClient.post(`${API_URL}/verify-otp-login`, { 
            identifier, 
            otp 
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Invalid OTP. Please try again.";
        throw new Error(errorMessage);
    }
};