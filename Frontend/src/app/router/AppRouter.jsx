import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../providers/AuthProvider';
import { PermissionsProvider } from '../providers/PermissionsProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AdminLayout from '../../shared/layouts/AdminLayout';
import SuperAdminLayout from '../../shared/layouts/SuperAdminLayout';

// Pages
import Login from '../../modules/auth/pages/Login';
import ProjectDetailsLayout from '../../modules/projects/layouts/ProjectDetailsLayout';
import ProjectListPage from '../../modules/projects/pages/ProjectListPage';
import DPRListPage from '../../modules/projects/pages/DPRListPage';
import ProjectOverview from '../../modules/projects/components/overview/ProjectOverview';
import ProjectInventoryTab from '../../modules/projects/components/ProjectInventoryTab'; 
import InventoryPage from '../../modules/inventory/pages/InventoryPage';
import InventoryListPage from '../../modules/inventory/pages/InventoryListPage';
import MaterialDetailsPage from '../../modules/inventory/pages/MaterialDetailsPage';
import EquipmentDetailsPage from '../../modules/inventory/pages/EquipmentDetailsPage';
import InventoryHistoryPage from '../../modules/inventory/pages/InventoryHistoryPage';
import PurchaseOrderListPage from '../../modules/inventory/pages/PurchaseOrderListPage';
import MaterialRequestListPage from '../../modules/inventory/pages/MaterialRequestListPage';
import MaterialRequestDetailsPage from '../../modules/inventory/pages/MaterialRequestDetailsPage';
import SupplierListPage from '../../modules/inventory/pages/SupplierListPage'; 
import InspectionListPage from '../../modules/inspection/pages/InspectionListPage';

// Profile & Roles Management
import ManageUsersRoles from '../../modules/profile/pages/ManageUsersRoles';

// Dashboards
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import ApprovalsPage from '../../modules/approvals/pages/ApprovalsPage';

// 🚨 IMPORT THE REAL SUPER ADMIN DASHBOARD
import SuperAdminDashboard from '../../modules/superadmin/pages/Dashboard';
import CompaniesListPage from '../../modules/superadmin/pages/CompaniesListPage';
import SuperAdminProfile from '../../modules/superadmin/pages/Profile';

// Placeholders for nested tabs (replace with real pages when built)
const PlaceholderTab = ({ title }) => <div className="p-12 text-center text-slate-500 bg-white min-h-[400px] flex items-center justify-center rounded-b-xl border border-slate-200"><p className="text-lg font-medium">{title} submodule is under construction.</p></div>;

const AppRouter = () => {
    return (
        // 🚨 WRAPPED THE ENTIRE APP IN THEME PROVIDER
        <ThemeProvider>
            <AuthProvider>
                <PermissionsProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            
                            {/* ================================================== */}
                            {/* 🚨 STRICTLY SUPER ADMIN SECTION                    */}
            ``                {/* ================================================== */}
                            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                                <Route element={<SuperAdminLayout />}>
                                    <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                                    <Route path="/superadmin/companies" element={<CompaniesListPage />} />
                                    <Route path="/superadmin/profile" element={<SuperAdminProfile />} />
                                </Route>
                            </Route>

                            {/* ================================================== */}
                            {/* 🚨 STRICTLY COMPANY/SITE ADMIN SECTION             */}
                            {/* ================================================== */}
                            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE']} />}>
                                <Route element={<AdminLayout />}>
                                    
                                    {/* Standard Dashboard */}
                                    <Route path="/admin/dashboard" element={<DashboardPage />} />
                                    
                                    {/* Profile Section */}
                                    <Route path="/profile" element={<ManageUsersRoles />} />
                                    
                                    {/* Approvals Dashboard */}
                                    <Route path="/approvals" element={<ApprovalsPage />} />
                                    
                                    {/* Projects Routes */}
                                    <Route path="/projects" element={<ProjectListPage />} />
                                    <Route path="/projects/:projectId" element={<ProjectDetailsLayout />}>
                                        <Route index element={<Navigate to="overview" replace />} />
                                        <Route path="overview" element={<ProjectOverview />} />
                                        <Route path="attendance" element={<PlaceholderTab title="Attendance" />} />
                                        <Route path="dpr" element={<DPRListPage />} />
                                        <Route path="tasks" element={<PlaceholderTab title="Tasks" />} />
                                        <Route path="transactions" element={<PlaceholderTab title="Transactions" />} />
                                        <Route path="timeline" element={<PlaceholderTab title="Timeline" />} />
                                        <Route path="inventory" element={<ProjectInventoryTab />} />
                                        <Route path="subcontractors" element={<PlaceholderTab title="Sub-contractors" />} />
                                    </Route>

                                    {/* Inventory Routes */}
                                    <Route path="/inventory" element={<InventoryPage />} />
                                    <Route path="/inventory/list" element={<InventoryListPage />} />
                                    <Route path="/inventory/history" element={<InventoryHistoryPage />} />
                                    <Route path="/inventory/material/:id" element={<MaterialDetailsPage />} />
                                    <Route path="/inventory/equipment/:id" element={<EquipmentDetailsPage />} />
                                    <Route path="/inventory/po" element={<PurchaseOrderListPage />} />
                                    <Route path="/inventory/requests" element={<MaterialRequestListPage />} />
                                    <Route path="/inventory/requests/:id" element={<MaterialRequestDetailsPage />} />
                                    <Route path="/inventory/suppliers" element={<SupplierListPage />} />

                                    {/* Inspection Routes */}
                                    <Route path="/inspection" element={<InspectionListPage />} />
                                    
                                </Route>
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </PermissionsProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default AppRouter;