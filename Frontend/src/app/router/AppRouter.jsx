import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../providers/AuthProvider';
import { PermissionsProvider } from '../providers/PermissionsProvider';
import ProtectedRoute from './ProtectedRoute';
import Login from '../../modules/auth/pages/Login';
import AdminLayout from '../../shared/layouts/AdminLayout';
import ProjectDetailsLayout from '../../modules/projects/layouts/ProjectDetailsLayout';
import ProjectListPage from '../../modules/projects/pages/ProjectListPage';
import DPRListPage from '../../modules/projects/pages/DPRListPage';
import ProjectOverview from '../../modules/projects/components/overview/ProjectOverview';
import ProjectInventoryTab from '../../modules/projects/components/ProjectInventoryTab'; // Verified
import InventoryPage from '../../modules/inventory/pages/InventoryPage';
import InventoryListPage from '../../modules/inventory/pages/InventoryListPage';
import MaterialDetailsPage from '../../modules/inventory/pages/MaterialDetailsPage';
import EquipmentDetailsPage from '../../modules/inventory/pages/EquipmentDetailsPage';
import InventoryHistoryPage from '../../modules/inventory/pages/InventoryHistoryPage';
import PurchaseOrderListPage from '../../modules/inventory/pages/PurchaseOrderListPage';
import MaterialRequestListPage from '../../modules/inventory/pages/MaterialRequestListPage';
import MaterialRequestDetailsPage from '../../modules/inventory/pages/MaterialRequestDetailsPage';

const SuperAdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Super Admin Dashboard</h1></div>;
const AdminDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold text-slate-800">Welcome to Admin Dashboard</h1></div>;
const PlaceholderTab = ({ title }) => <div className="p-12 text-center text-slate-500 bg-white min-h-[400px] flex items-center justify-center rounded-b-xl border border-slate-200"><p className="text-lg font-medium">{title} submodule is under construction.</p></div>;

const AppRouter = () => {
    return (
        <AuthProvider>
            <PermissionsProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}><Route element={<AdminLayout />}><Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} /></Route></Route>
                        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE']} />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/projects" element={<ProjectListPage />} />
                                <Route path="/projects/:projectId" element={<ProjectDetailsLayout />}>
                                    <Route index element={<Navigate to="overview" replace />} />
                                    <Route path="overview" element={<ProjectOverview />} />
                                    <Route path="attendance" element={<PlaceholderTab title="Attendance" />} />
                                    <Route path="dpr" element={<DPRListPage />} />
                                    <Route path="tasks" element={<PlaceholderTab title="Tasks" />} />
                                    <Route path="transactions" element={<PlaceholderTab title="Transactions" />} />
                                    <Route path="timeline" element={<PlaceholderTab title="Timeline" />} />
                                    <Route path="inventory" element={<ProjectInventoryTab />} /> {/* Updated */}
                                    <Route path="subcontractors" element={<PlaceholderTab title="Sub-contractors" />} />
                                </Route>
                                <Route path="/inventory" element={<InventoryPage />} />
                                <Route path="/inventory/list" element={<InventoryListPage />} />
                                <Route path="/inventory/history" element={<InventoryHistoryPage />} />
                                <Route path="/inventory/material/:id" element={<MaterialDetailsPage />} />
                                <Route path="/inventory/equipment/:id" element={<EquipmentDetailsPage />} />
                                <Route path="/inventory/po" element={<PurchaseOrderListPage />} />
                                <Route path="/inventory/requests" element={<MaterialRequestListPage />} />
                                <Route path="/inventory/requests/:id" element={<MaterialRequestDetailsPage />} />
                            </Route>
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </PermissionsProvider>
        </AuthProvider>
    );
};

export default AppRouter;