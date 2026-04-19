import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTheme } from '../../app/providers/ThemeProvider'; // 🚨 1. Import Global Theme
import { Bell, Search, ChevronDown, LayoutGrid, Building2, User } from 'lucide-react';

const SuperAdminLayout = () => {
  const location = useLocation();
  const { user } = useAuth(); 
  
  // 🚨 2. Connect to global theme instead of local useState('Light')
  const { theme, setTheme } = useTheme(); 
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    setGlobalSearch("");
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🚨 3. Removed the local useEffect that was fighting with the ThemeProvider

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const getBreadcrumb = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return (
      // Added dark:text-white to ensure it's always visible
      <div className="flex items-center text-lg font-bold text-gray-900 dark:text-white tracking-tight">
        {pathnames.length > 1 ? pathnames[1].charAt(0).toUpperCase() + pathnames[1].slice(1) : "Dashboard"}
      </div>
    );
  };

  return (
    // Added dark:bg-[#0b1120] to the main wrapper
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#0b1120] overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-[260px] bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col z-50 shrink-0 transition-colors duration-300">
        <div className="h-24 px-8 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-black dark:bg-[#0f62fe] rounded flex items-end justify-center">
            <div className="w-1 h-4 bg-[#0f62fe] dark:bg-white mx-0.5"></div>
            <div className="w-1 h-6 bg-[#0f62fe] dark:bg-white mx-0.5"></div>
            <div className="w-1 h-3 bg-amber-700 dark:bg-slate-300 mx-0.5"></div>
          </div>
          <span className="font-bold text-xl text-[#0f62fe] dark:text-white">SampleWeb</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/superadmin/dashboard" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-blue-50/80 text-[#0f62fe] dark:bg-[#0f62fe]/20 dark:text-[#60a5fa]' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            <LayoutGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/superadmin/companies" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-blue-50/80 text-[#0f62fe] dark:bg-[#0f62fe]/20 dark:text-[#60a5fa]' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            <Building2 size={18} /> Companies
          </NavLink>
          <NavLink to="/superadmin/profile" className={({isActive}) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-blue-50/80 text-[#0f62fe] dark:bg-[#0f62fe]/20 dark:text-[#60a5fa]' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
            <User size={18} /> Profile
          </NavLink>
        </nav>

        {/* Theme Toggle Buttons */}
        <div className="p-4 flex gap-2 mt-auto mb-4">
          <button 
            onClick={() => setTheme('light')} 
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${theme === 'light' ? 'bg-[#0f62fe] text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')} 
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${theme === 'dark' ? 'bg-[#0f62fe] text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            Dark
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* GLOBAL HEADER */}
        <header className="h-24 flex items-center justify-between px-8 bg-[#f8fafc] dark:bg-[#0b1120] border-b border-transparent dark:border-slate-800 shrink-0 transition-colors duration-300">
          <div>{getBreadcrumb()}</div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white dark:bg-[#1e293b] px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm w-72 transition-colors">
              <Search size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="ml-3 bg-transparent outline-none text-sm w-full text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 font-medium"
                placeholder="Search global companies..."
              />
            </div>

            <button className="bg-white dark:bg-[#1e293b] p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-colors">
              <Bell size={20} />
            </button>

            <div ref={profileDropdownRef} className="relative">
              <div 
                className="flex items-center gap-3 bg-white dark:bg-[#1e293b] px-4 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="pr-2">
                  <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user?.name || "System Admin"}</div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">{user?.userType || "SUPER_ADMIN"}</div>
                </div>
                <ChevronDown size={14} className="text-gray-400 dark:text-slate-500" />
              </div>
              
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1e293b] shadow-xl border border-gray-100 dark:border-slate-700 rounded-2xl py-2 z-[100]">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Log out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8 pt-6">
            <Outlet context={{ globalSearch }} />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;