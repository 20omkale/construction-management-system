
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import SuperAdminLayout from "./shared/layouts/SuperAdminLayout";
import CompaniesPage from "./modules/superadmin/pages/CompaniesPage";

import AdminLayout from "./shared/layouts/AdminLayout";
import ProjectsPage from "./modules/admin/pages/ProjectsPage";

import AdminDashboard from "./modules/admin/pages/AdminDashboard";
import AdminProfile from "./modules/admin/pages/AdminProfile";

import InventoryPage from "./modules/inventory/pages/InventoryPage";
import LoginPage from "./modules/auth/pages/Login";

import { isAuthenticated } from "./modules/admin/services/authStorage";
function App() {
 

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginPage />} />

        {/* SUPER ADMIN */}
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="dashboard" element={<div className="p-6 text-slate-500 text-center mt-10">SuperAdmin Dashboard (Coming Soon)</div>} />
          <Route path="profile" element={<div className="p-6 text-slate-500 text-center mt-10">SuperAdmin Profile (Coming Soon)</div>} />
          <Route index element={<Navigate to="companies" replace />} />
        </Route>

        {/* ADMIN */}
<Route
  path="/admin"
  element={
    isAuthenticated()
      ? <AdminLayout />
      : <Navigate to="/login" replace />
  }
>        <Route path="projects" element={<ProjectsPage />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* FALLBACK */}
<Route path="*" element={<Navigate to="/login" replace />} />      </Routes>
    </BrowserRouter>

  );
}

export default App;