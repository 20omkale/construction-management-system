import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Header from './Header';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="font-sans bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 min-h-screen">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        <Header title="Admin Projects" onMenuClick={() => setSidebarOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}

