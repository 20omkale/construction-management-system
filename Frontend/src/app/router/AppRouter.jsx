import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../providers/AuthProvider';
import { PermissionsProvider } from '../providers/PermissionsProvider';
import ProtectedRoute from './ProtectedRoute';
import Login from '../../modules/auth/pages/Login';

// Dummy dashboards for testing the routing
const SuperAdminDashboard = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <h1 className="text-4xl font-bold text-blue-400">Super Admin Dashboard</h1>
        <p className="mt-4">You have ultimate access.</p>
    </div>
);

const AdminDashboard = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
        <h1 className="text-4xl font-bold text-green-600">Standard Admin Dashboard</h1>
        <p className="mt-4">You have limited access.</p>
    </div>
);

const AppRouter = () => {
    return (
        <AuthProvider>
            <PermissionsProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Auth Route */}
                        <Route path="/" element={<Login />} />
                        
                        {/* 🔒 SUPER ADMIN ONLY ROUTES */}
                        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                            {/* Future Super Admin routes go here (e.g., Company CRUD) */}
                        </Route>

                        {/* 🔒 STANDARD ADMIN ONLY ROUTES */}
                        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            {/* Future Admin routes go here (e.g., Project CRUD) */}
                        </Route>

                        {/* Catch-all: Redirect unknown URLs back to login */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </PermissionsProvider>
        </AuthProvider>
    );
};

export default AppRouter;