// src/shared/layouts/AdminLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); 
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState('Light');

  // Activate Tailwind Dark Mode
  useEffect(() => {
    if (theme === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Exact Figma Breadcrumb Typography
  const getBreadcrumb = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab') || 'materials';
    const tabName = tab.charAt(0).toUpperCase() + tab.slice(1);

    if (path.includes('inventory')) {
      return (
        <div className="flex items-center text-lg tracking-tight">
          <span className="font-black text-gray-900 dark:text-white text-xl">Inventory</span>
          <span className="text-gray-400 mx-2 font-medium">›</span>
          
          {path === '/inventory' && <span className="text-gray-600 dark:text-gray-300 font-medium">Dashboard</span>}
          
          {path.includes('history') && (
            <>
              <span className="text-gray-600 dark:text-gray-300 font-medium">Inventory History</span>
              <span className="text-gray-400 mx-2 font-medium">›</span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">{tabName}</span>
            </>
          )}

          {path.includes('list') && (
            <>
              <span className="text-gray-600 dark:text-gray-300 font-medium">Global Inventory</span>
              <span className="text-gray-400 mx-2 font-medium">›</span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">{tabName}</span>
            </>
          )}
          
          {(path.includes('material/') || path.includes('equipment/')) && (
            <span className="text-gray-600 dark:text-gray-300 font-medium">Details</span>
          )}
        </div>
      );
    }
    return <span className="font-black text-gray-900 dark:text-white text-xl">Dashboard</span>;
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f4f8] dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col z-50 shrink-0 transition-colors duration-300">
        <div className="h-20 px-8 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-black dark:bg-gray-900 rounded flex items-end justify-center"><div className="w-1 h-4 bg-[#0f62fe] mx-0.5"></div><div className="w-1 h-6 bg-[#0f62fe] mx-0.5"></div><div className="w-1 h-3 bg-amber-700 mx-0.5"></div></div>
          <span className="font-bold text-xl text-[#0f62fe] dark:text-blue-400">SampleWeb</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/admin/dashboard" className={({isActive}) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0f62fe] dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0f62fe] dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> Projects
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0f62fe] dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Profile
          </NavLink>
          <NavLink to="/inventory" className={({isActive}) => `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-all ${isActive || location.pathname.includes('/inventory') ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0f62fe] dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> Inventory
          </NavLink>
        </nav>

        {/* Real Theme Toggle */}
        <div className="p-4 flex gap-2">
          <button onClick={() => setTheme('Light')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${theme === 'Light' ? 'bg-[#0f62fe] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg> Light</button>
          <button onClick={() => setTheme('Dark')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${theme === 'Dark' ? 'bg-[#0f62fe] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> Dark</button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f0f4f8] dark:bg-gray-900 transition-colors duration-300">
        
        {/* TOP HEADER (Breadcrumbs only) */}
        <header className="h-20 flex items-center justify-between px-8 bg-[#f0f4f8] dark:bg-gray-900 border-b border-transparent transition-colors duration-300">
          <div>{getBreadcrumb()}</div>
          <div className="flex items-center gap-4 relative">
            <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-gray-600 dark:text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="w-8 h-8 rounded bg-[#0f62fe] text-white flex items-center justify-center font-bold text-xs">RA</div>
              <div className="hidden md:block">
                <p className="text-sm font-bold leading-none dark:text-white">{user?.name || "Robert Allen"}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase">{user?.userType || "Super Admin"}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 top-14 mt-2 w-56 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl py-2 z-[110] animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="w-full text-left px-4 py-2.5 text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">Log out</button>
              </div>
            )}
          </div>
        </header>

        {/* SCROLLING PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-2 md:p-8 bg-[#f0f4f8] dark:bg-gray-900 transition-colors duration-300">
          <div key={location.pathname} className="animate-in fade-in duration-300 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;