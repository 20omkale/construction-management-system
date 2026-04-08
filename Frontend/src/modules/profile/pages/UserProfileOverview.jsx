import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Building, Settings, ListChecks, LogOut, ChevronRight, CalendarDays, Clock3 } from 'lucide-react';
import LogoutConfirmationModal from '../../../components/common/LogoutConfirmationModal';
import './UserProfileOverview.css';

const UserProfileOverview = () => {
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Mock data - In a real app, this would come from an Auth or User context.
    const currentUser = {
        name: 'Pratik Bhure',
        companyName: 'ABC Infrastructure Pvt Ltd',
        role: 'Company Administrator',
        userId: 'SYS-ADM-001',
        accountCreated: '02 Jan 2024',
        lastLogin: '14 Aug 2025 · 09:12 AM',
        isDesktopAdmin: true // Mock flag for design consistency
    };

    const handleLogOut = () => {
        // Mock actual logout logic: clear tokens, user data, etc.
        console.log('User is logging out...');
        localStorage.removeItem('userToken'); // Example
        navigate('/login'); // Redirect to login page
    };

    const profileSubModules = [
        { title: 'Personal Information', icon: User, path: '/profile/personal-info' },
        { title: 'Company Details', icon: Building, path: '/profile/company-details' },
        { title: 'Manage Users and Roles', icon: Settings, path: '/profile/manage-users-roles' },
        { title: 'Approval History', icon: ListChecks, path: '/profile/approval-history' }
    ];

    return (
        <div className="profile-overview-page-container">
            <header className="profile-overview-header">
                <h1 className="text-3xl font-black text-slate-800">Profile</h1>
                {currentUser.isDesktopAdmin && (
                     <div className="flex gap-2.5 items-center">
                        <User size={18} className="text-[#0066CC]"/>
                        <p className="text-sm font-black text-slate-500">Company Administrator</p>
                    </div>
                )}
            </header>

            <div className="profile-overview-content flex flex-col gap-10">
                
                <section className="profile-account-info-section bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Account Info</h2>
                    
                    <div className="account-info-details flex gap-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-800">{currentUser.name}</h3>
                            <p className="text-slate-500 font-bold text-[13px]">{currentUser.companyName}</p>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">User ID: {currentUser.userId}</p>
                        </div>
                        <div className="border-l border-slate-100 pl-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <CalendarDays size={18} className="text-[#0066CC]" />
                                <p className="text-slate-700 text-sm font-bold">Account created: <span className="font-black">{currentUser.accountCreated}</span></p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock3 size={18} className="text-[#0066CC]" />
                                <p className="text-slate-700 text-sm font-bold">Last Login: <span className="font-black">{currentUser.lastLogin}</span></p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="profile-account-settings-section space-y-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Account Settings</h2>
                    
                    <div className="account-settings-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profileSubModules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <Link 
                                    to={module.path} 
                                    key={module.title} 
                                    className="account-setting-item-card bg-white p-7 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex justify-between items-center group cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 bg-blue-50 text-[#0066CC] rounded-2xl">
                                            <Icon size={20} />
                                        </div>
                                        <h4 className="text-[15px] font-black text-slate-800 group-hover:text-[#0066CC]">{module.title}</h4>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-[#0066CC] group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            );
                        })}
                    </div>
                </section>
                
                <footer className="profile-overview-footer pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex items-center gap-2.5 px-10 py-4 bg-red-50 text-[#FF3B30] text-[13px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#FF3B30] hover:text-white hover:-translate-y-0.5 transition-all shadow-md shadow-red-100"
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                </footer>
            </div>

            <LogoutConfirmationModal 
                isOpen={isLogoutModalOpen} 
                onClose={() => setIsLogoutModalOpen(false)} 
                onConfirm={handleLogOut} 
            />
        </div>
    );
};

export default UserProfileOverview;