import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api/v1';

const JWTtoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YzZkNWU5MC1mNjI5LTQ3MmYtYjVlOC1kMmE3YjJhOGIxYzkiLCJpYXQiOjE3NzUwMTU1MDYsImV4cCI6MTc3NTYyMDMwNn0.gTwVG6L5-Mhchnii_S37DGZijlC7UO_gPlJu-yw8mxw';

localStorage.setItem('token', JWTtoken);

// Helper function to get headers with the token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchCompanies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/companies`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

export const getSuperAdminStats = async()=>{
    try {
        const res = await axios.get(`${API_BASE_URL}/super-admin/dashboard/stats`,{
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching super admin stats:', error);
        throw error;
    }
}

export const createCompany = async (companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to create company');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompanyStatus = async (companyId, isActive) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to update company status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating company status:', error);
    throw error;
  }
};

export const deleteCompany = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/companies/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to delete company');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

export const fetchCompanyDetails = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch company details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching company details:', error);
    throw error;
  }
};
