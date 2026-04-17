import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { ClipboardCheck } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useAuth(); 
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState('Light');
  const profileDropdownRef = useRef(null);

  // 🚨 GLOBAL SEARCH STATE
  const [globalSearch, setGlobalSearch] = useState("");

  // Clear search bar automatically when you navigate to a new page
  useEffect(() => {
    setGlobalSearch("");
  }, [location.pathname]);

  // Click outside to close profile
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
    if (theme === 'Dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Breadcrumbs
  const getBreadcrumb = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return (
      <div className="flex items-center text-lg font-bold text-gray-900 tracking-tight">
        {pathnames.length > 0 ? pathnames[0].charAt(0).toUpperCase() + pathnames[0].slice(1) : "Dashboard"}
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-gray-900 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-[260px] bg-white dark:bg-gray-800 border-r border-gray-100 hidden md:flex flex-col z-50 shrink-0">
        <div className="h-24 px-8 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-black rounded flex items-end justify-center">
            <div className="w-1 h-4 bg-[#0f62fe] mx-0.5"></div>
            <div className="w-1 h-6 bg-[#0f62fe] mx-0.5"></div>
            <div className="w-1 h-3 bg-amber-700 mx-0.5"></div>
          </div>
          <span className="font-bold text-xl text-[#0f62fe]">SampleWeb</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin/dashboard" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-blue-50/80 text-[#0f62fe]' : 'text-slate-600 hover:bg-slate-50'}`}>Dashboard</NavLink>
          <NavLink to="/projects" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive || location.pathname.includes('/projects') ? 'bg-blue-50/80 text-[#0f62fe]' : 'text-slate-600 hover:bg-slate-50'}`}>Projects</NavLink>
          <NavLink to="/inventory" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive && !location.pathname.includes('/projects') ? 'bg-blue-50/80 text-[#0f62fe]' : 'text-slate-600 hover:bg-slate-50'}`}>Inventory</NavLink>
          <NavLink to="/approvals" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-blue-50/80 text-[#0f62fe]' : 'text-slate-600 hover:bg-slate-50'}`}>Approvals</NavLink>
          <NavLink to="/inspection" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-blue-50/80 text-[#0f62fe]' : 'text-slate-600 hover:bg-slate-50'}`}>Inspection</NavLink>
          <NavLink to="/profile" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-blue-50/80 text-[#0f62fe]' : 'text-slate-600 hover:bg-slate-50'}`}>Profile</NavLink>
        </nav>

        <div className="p-4 flex gap-2 mt-auto mb-4">
          <button onClick={() => setTheme('Light')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${theme === 'Light' ? 'bg-[#0f62fe] text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>Light</button>
          <button onClick={() => setTheme('Dark')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${theme === 'Dark' ? 'bg-[#0f62fe] text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>Dark</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* GLOBAL HEADER */}
        <header className="h-24 flex items-center justify-between px-8 bg-[#f8fafc] shrink-0">
          <div>{getBreadcrumb()}</div>
          
          <div className="flex items-center gap-4">
            
            {/* 🚨 Connected Global Search Bar */}
            <div className="flex items-center bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm w-72">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="ml-3 bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400 font-medium"
                placeholder="Search companies, users..."
              />
            </div>

            {/* Bell Icon */}
            <button className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
              <Bell size={20} />
            </button>

            {/* Profile Dropdown */}
            <div ref={profileDropdownRef} className="relative">
              <div 
                className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img 
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover shadow-sm"
                />
                <div className="pr-2">
                  <div className="text-sm font-bold text-gray-900 leading-tight">{user?.name || "Robert Allen"}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{user?.userType || "Admin"}</div>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border border-gray-100 rounded-2xl py-2 z-[100]">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50">Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area - Pass search state to children */}
        <main className="flex-1 overflow-y-auto px-8 pb-8">
            <Outlet context={{ globalSearch }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;