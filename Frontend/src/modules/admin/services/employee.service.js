// src/modules/admin/services/employee.service.js
import api from '../../../shared/utils/api';

export const employeeService = {
  // Fetch all employees for a specific company
  getCompanyEmployees: async (params = {}) => {
    const response = await api.get('/admin/employees', { params });
    return response.data;
  },

  // Create a new site worker or staff member
  createEmployee: async (employeeData) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },

  // Update employee details (e.g., changing roles or site assignments)
  updateEmployee: async (id, updateData) => {
    const response = await api.patch(`/admin/employees/${id}`, updateData);
    return response.data;
  },

  // Deactivate an employee
  deactivateEmployee: async (id) => {
    const response = await api.patch(`/admin/employees/${id}/deactivate`);
    return response.data;
  }
};