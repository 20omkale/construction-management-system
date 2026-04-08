import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { Bell } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); 
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState('Light');
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (theme === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // GLOBAL DYNAMIC BREADCRUMB
  const getBreadcrumb = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return (
      <div className="flex items-center text-sm font-bold tracking-tight">
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          // Format long IDs as "Project Details"
          const displayTitle = (value.length > 20) ? "Project Details" : value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

          return (
            <React.Fragment key={value}>
              <span className={last ? 'text-slate-500 font-medium' : 'text-slate-800'}>
                {displayTitle}
              </span>
              {!last && <span className="mx-2 text-slate-400 font-normal">›</span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f4f8] dark:bg-gray-900 overflow-hidden font-sans">
      <aside className="w-[260px] bg-white dark:bg-gray-800 border-r border-gray-200 hidden md:flex flex-col z-50 shrink-0">
        <div className="h-20 px-8 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-black rounded flex items-end justify-center">
            <div className="w-1 h-4 bg-[#0f62fe] mx-0.5"></div>
            <div className="w-1 h-6 bg-[#0f62fe] mx-0.5"></div>
            <div className="w-1 h-3 bg-amber-700 mx-0.5"></div>
          </div>
          <span className="font-bold text-xl text-[#0f62fe]">SampleWeb</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/admin/dashboard" className={({isActive}) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold ${isActive ? 'bg-blue-50 text-[#0f62fe]' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</NavLink>
          <NavLink to="/projects" className={({isActive}) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold ${isActive || location.pathname.includes('/projects') ? 'bg-blue-50 text-[#0f62fe]' : 'text-gray-600 hover:bg-gray-50'}`}>Projects</NavLink>
          <NavLink to="/inventory" className={({isActive}) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold ${isActive && !location.pathname.includes('/projects') ? 'bg-blue-50 text-[#0f62fe]' : 'text-gray-600 hover:bg-gray-50'}`}>Inventory</NavLink>
          
          {/* 🚨 PROFILE NAVIGATION BUTTON ADDED HERE */}
          <NavLink to="/profile" className={({isActive}) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold ${isActive ? 'bg-blue-50 text-[#0f62fe]' : 'text-gray-600 hover:bg-gray-50'}`}>Profile</NavLink>
        </nav>

        <div className="p-4 flex gap-2 mt-auto">
          <button onClick={() => setTheme('Light')} className={`flex-1 py-2 rounded-md text-sm font-bold ${theme === 'Light' ? 'bg-[#0f62fe] text-white' : 'text-gray-500'}`}>Light</button>
          <button onClick={() => setTheme('Dark')} className={`flex-1 py-2 rounded-md text-sm font-bold ${theme === 'Dark' ? 'bg-[#0f62fe] text-white' : 'text-gray-500'}`}>Dark</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 bg-[#EDF2F7] shrink-0 border-b border-slate-200">
          <div>{getBreadcrumb()}</div>
          <div className="flex items-center gap-6">
            <Bell className="w-5 h-5 text-slate-600" />
            <div ref={profileDropdownRef} className="relative">
              <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className="w-8 h-8 rounded bg-[#0f62fe] text-white flex items-center justify-center font-bold text-xs">{user?.name?.substring(0, 2).toUpperCase() || "RA"}</div>
                <div className="hidden md:block text-right">
                  <p className="text-xs font-black text-slate-800 leading-tight">{user?.name || "Robert Allen"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.userType || "Super Admin"}</p>
                </div>
              </div>
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border rounded-2xl py-2 z-[100]">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50">Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;