// src/modules/superadmin/pages/dummy.js (or whatever your dashboard file is named)
import Header from '../../../shared/layouts/Header';

const SuperAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#111827] flex flex-col">
      {/* 1. Mount the Header at the top of the screen! */}
      <Header />

      {/* 2. The rest of your dashboard */}
      <div className="flex-1 flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Super Admin Dashboard</h1>
        <p className="text-gray-400">You have ultimate access.</p>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;