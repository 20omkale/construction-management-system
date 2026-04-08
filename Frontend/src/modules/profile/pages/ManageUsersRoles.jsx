import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Edit, Briefcase, User as UserIcon, MapPin, Loader2, CheckSquare, SlidersHorizontal, LogOut, X, Users, ListChecks, ChevronRight, ArrowLeft } from 'lucide-react';
import { getUsersAPI, toggleUserStatusAPI, deleteUserAPI } from '../services/user.service';
import { getRolesAPI, deleteRoleAPI } from '../services/role.service';
import CreateUserModal from '../components/CreateUserModal';
import CreateRoleModal from '../components/CreateRoleModal';
import UserDetailsModal from '../components/UserDetailsModal';
import { useAuth } from '../../../app/providers/AuthProvider';

const ManageUsersRoles = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth(); 
    
    // 🚨 Defaulting to 'menu' so it opens the Landing Page first
    const [activeMainTab, setActiveMainTab] = useState('menu');
    const [activeSubTab, setActiveSubTab] = useState('users');
    
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [projects, setProjects] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [filterStatus, setFilterStatus] = useState(''); 
    const [filterRole, setFilterRole] = useState('');
    const [filterProject, setFilterProject] = useState('');
    
    const [tempFilterStatus, setTempFilterStatus] = useState(''); 
    const [tempFilterRole, setTempFilterRole] = useState('');
    const [tempFilterProject, setTempFilterProject] = useState('');

    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
    
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const filterRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        setSelectedIds([]); 
        setIsDeleteMode(false); 
        
        try {
            const token = localStorage.getItem('accessToken');
            const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
            
            const [projectsRes, usersRes, rolesRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/v1/projects`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } })),
                getUsersAPI().catch(() => ({ data: [] })),
                getRolesAPI().catch(() => ({ data: [] }))
            ]);

            if (projectsRes.data?.data) setProjects(projectsRes.data.data);
            if (usersRes.data) setUsers(usersRes.data);
            if (rolesRes.data) setRoles(rolesRes.data);
            
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        if (activeMainTab === 'manage') {
            fetchAllData(); 
        }
    }, [activeMainTab]);

    const handleToggleStatus = async (id, currentStatus) => {
        if (isDeleteMode) return; 
        try {
            await toggleUserStatusAPI(id, !currentStatus);
            const res = await getUsersAPI();
            if (res.success) setUsers(res.data);
        } catch (err) { alert(err.message); }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleTrashClick = () => {
        if (!isDeleteMode) {
            setIsDeleteMode(true);
            return;
        }
        if (isDeleteMode && selectedIds.length === 0) {
            setIsDeleteMode(false);
            return;
        }
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (activeSubTab === 'users') {
                for (const id of selectedIds) await deleteUserAPI(id);
            } else {
                for (const id of selectedIds) await deleteRoleAPI(id);
            }
            fetchAllData(); 
            setIsDeleteModalOpen(false);
            setIsDeleteMode(false);
        } catch (err) {
            alert(err.message || "Failed to delete items.");
            setIsDeleteModalOpen(false);
        }
    };

    const openFilter = () => {
        setTempFilterStatus(filterStatus);
        setTempFilterRole(filterRole);
        setTempFilterProject(filterProject);
        setIsFilterOpen(!isFilterOpen);
    };

    const handleApplyFilters = () => {
        setFilterStatus(tempFilterStatus);
        setFilterRole(tempFilterRole);
        setFilterProject(tempFilterProject);
        setIsFilterOpen(false);
    };

    const handleClearFilters = () => {
        setFilterStatus('');
        setFilterRole('');
        setFilterProject('');
        setTempFilterStatus('');
        setTempFilterRole('');
        setTempFilterProject('');
        setIsFilterOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus ? (filterStatus === 'ACTIVE' ? u.isActive : !u.isActive) : true;
        const matchesRole = filterRole ? u.role?.id === filterRole : true;
        const matchesProject = filterProject ? u.projects?.some(p => p.id === filterProject) : true;
        
        return matchesSearch && matchesStatus && matchesRole && matchesProject;
    });

    const filteredRoles = roles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const isFilterActive = filterStatus || filterRole || filterProject;

    // Helper for Menu Items
    const MenuItem = ({ icon, label, onClick }) => (
        <div onClick={onClick} className="flex justify-between items-center p-5 rounded-2xl hover:bg-slate-50 cursor-pointer group transition-all border border-transparent hover:border-slate-100">
            <div className="flex items-center gap-4">
                <div className="text-slate-400 group-hover:text-[#0066CC] transition-colors">{icon}</div>
                <span className="font-bold text-[15px] text-slate-700 group-hover:text-[#0066CC] transition-colors">{label}</span>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-[#0066CC] group-hover:translate-x-1 transition-transform" />
        </div>
    );

    return (
        <div className="max-w-[1100px] mx-auto space-y-6 animate-in fade-in duration-500 pb-20 pt-6">
            
            {/* 🚨 PROFILE HEADER CARD (No Logout Button Here) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex justify-between items-start">
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{currentUser?.name || 'Rahul Sharma'}</h1>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                            <Briefcase size={16} className="text-slate-400" /> {currentUser?.userType?.replace('_', ' ') || 'Admin'}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                            <UserIcon size={16} className="text-slate-400" /> User ID: {currentUser?.employeeId || 'SYS-ADM-001'}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                            <MapPin size={16} className="text-slate-400" /> ABC Infrastructure Pvt Ltd
                        </div>
                    </div>
                </div>
                
                <button className="flex items-center gap-2 px-6 py-3 bg-[#0066CC] text-white text-sm font-black rounded-xl hover:bg-blue-800 transition-all shadow-md">
                    <Edit size={16} /> Edit Profile
                </button>
            </div>

            {/* 🚨 STATE 1: PROFILE LANDING MENU (Shows sub-modules list and Logout at bottom) */}
            {activeMainTab === 'menu' ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-4xl mx-auto mt-8 animate-in zoom-in-95 duration-200">
                    <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-5 mb-4">Account Settings</h2>
                    
                    <div className="space-y-2">
                        <MenuItem icon={<UserIcon size={20} />} label="Personal Information" onClick={() => setActiveMainTab('personal')} />
                        <MenuItem icon={<Briefcase size={20} />} label="Company Details" onClick={() => setActiveMainTab('company')} />
                        <MenuItem icon={<Users size={20} />} label="Manage Users & Roles" onClick={() => setActiveMainTab('manage')} />
                        <MenuItem icon={<ListChecks size={20} />} label="Approval History" onClick={() => setActiveMainTab('approval')} />
                    </div>
                    
                    {/* Logout Button ONLY appears here on the landing page */}
                    <div className="flex justify-center pt-10 mt-6 border-t border-slate-100">
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="px-16 py-4 bg-red-50 text-[#FF3B30] font-black text-[13px] uppercase tracking-widest rounded-full hover:bg-[#FF3B30] hover:text-white transition-all shadow-sm flex items-center gap-2"
                        >
                            <LogOut size={18} /> Log Out
                        </button>
                    </div>
                </div>
            ) : (
                
                /* 🚨 STATE 2: SUB-MODULE VIEW (Horizontal tabs, NO Logout button) */
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    
                    {/* Back Button to return to landing page */}
                    <button onClick={() => setActiveMainTab('menu')} className="flex items-center gap-2 text-slate-400 hover:text-[#0066CC] font-bold text-sm px-4 transition-colors">
                        <ArrowLeft size={16} /> Back to Profile Menu
                    </button>

                    {/* Horizontal Tabs */}
                    <div className="flex gap-8 border-b border-slate-200 px-4 mt-4">
                        <button onClick={() => setActiveMainTab('personal')} className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all border-b-[3px] ${activeMainTab === 'personal' ? 'text-[#0066CC] border-[#0066CC]' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                            <UserIcon size={18} /> Personal Information
                        </button>
                        <button onClick={() => setActiveMainTab('company')} className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all border-b-[3px] ${activeMainTab === 'company' ? 'text-[#0066CC] border-[#0066CC]' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                            <Briefcase size={18} /> Company Details
                        </button>
                        <button onClick={() => setActiveMainTab('manage')} className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all border-b-[3px] ${activeMainTab === 'manage' ? 'text-[#0066CC] border-[#0066CC]' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                            <Users size={18} /> Manage Users & Roles
                        </button>
                        <button onClick={() => setActiveMainTab('approval')} className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all border-b-[3px] ${activeMainTab === 'approval' ? 'text-[#0066CC] border-[#0066CC]' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                            <ListChecks size={18} /> Approval History
                        </button>
                    </div>

                    {/* MANAGE USERS MODULE CONTENT */}
                    {activeMainTab === 'manage' && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 min-h-[500px] animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-full w-fit mb-8">
                                <button onClick={() => { setActiveSubTab('users'); setSearchQuery(''); setIsDeleteMode(false); setSelectedIds([]); }} className={`px-10 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'users' ? 'bg-[#0066CC] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Users</button>
                                <button onClick={() => { setActiveSubTab('roles'); setSearchQuery(''); setIsDeleteMode(false); setSelectedIds([]); }} className={`px-10 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'roles' ? 'bg-[#0066CC] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Roles</button>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-slate-800 text-lg">{activeSubTab === 'users' ? 'Users List' : 'Roles Created'}</h3>
                                <div className="flex items-center gap-3 relative">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search Name or ID" 
                                            className="pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-[#0066CC] outline-none w-64 bg-white transition-all shadow-sm" 
                                        />
                                    </div>
                                    
                                    {activeSubTab === 'users' && (
                                        <div className="relative" ref={filterRef}>
                                            <button 
                                                onClick={openFilter} 
                                                className={`flex items-center gap-2 px-5 py-2.5 border font-black text-xs transition-all rounded-full ${isFilterActive ? 'bg-blue-100 text-[#0066CC] border-blue-200 shadow-sm' : 'bg-blue-50 text-slate-600 border-blue-100 hover:bg-blue-100'}`}
                                            >
                                                Filter By <SlidersHorizontal size={14} />
                                            </button>
                                            
                                            {isFilterOpen && (
                                                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-100 shadow-xl rounded-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="space-y-4">
                                                        <select value={tempFilterProject} onChange={e => setTempFilterProject(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC] cursor-pointer truncate">
                                                            <option value="">Project Name (All)</option>
                                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                        </select>
                                                        
                                                        <select value={tempFilterRole} onChange={e => setTempFilterRole(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC] cursor-pointer">
                                                            <option value="">Role Name (All)</option>
                                                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                        </select>

                                                        <select value={tempFilterStatus} onChange={e => setTempFilterStatus(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC] cursor-pointer">
                                                            <option value="">Active/Inactive (All)</option>
                                                            <option value="ACTIVE">Active</option>
                                                            <option value="INACTIVE">Inactive</option>
                                                        </select>
                                                        
                                                        <button onClick={handleApplyFilters} className="w-full py-3 bg-[#0066CC] text-white rounded-xl text-[13px] font-black hover:bg-blue-800 transition-all shadow-md mt-2">
                                                            Apply filters
                                                        </button>

                                                        {isFilterActive && (
                                                            <button onClick={handleClearFilters} className="w-full py-2 text-slate-400 hover:text-slate-700 font-bold text-xs transition-colors underline">
                                                                Clear all filters
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button onClick={() => activeSubTab === 'users' ? setIsUserModalOpen(true) : setIsRoleModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-800 transition-all shadow-md">
                                        <Plus size={16} /> Create {activeSubTab === 'users' ? 'User' : 'Role'}
                                    </button>

                                    <button 
                                        onClick={handleTrashClick} 
                                        className={`p-2.5 border rounded-xl transition-all ${
                                            isDeleteMode 
                                                ? (selectedIds.length > 0 ? 'bg-[#FF3B30] text-white border-[#FF3B30] shadow-md hover:bg-red-600' : 'bg-red-50 text-[#FF3B30] border-red-200 hover:bg-red-100') 
                                                : 'bg-[#FF3B30] text-white border-[#FF3B30] hover:bg-red-600 shadow-sm'
                                        }`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#0066CC]" size={32} /></div>
                            ) : activeSubTab === 'users' ? (
                                <div className="space-y-4">
                                    {filteredUsers.length === 0 ? (
                                        <p className="text-center py-10 text-slate-400 font-bold">No users found.</p>
                                    ) : filteredUsers.map(u => (
                                        <div 
                                            key={u.id} 
                                            onClick={() => {
                                                if (isDeleteMode) toggleSelection(u.id);
                                                else { setSelectedUser(u); setIsUserDetailsOpen(true); }
                                            }} 
                                            className={`flex justify-between items-center p-6 border rounded-2xl transition-all bg-white cursor-pointer group ${selectedIds.includes(u.id) ? 'border-red-400 shadow-sm bg-red-50/30' : 'border-slate-100 hover:border-blue-100 hover:shadow-sm'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {isDeleteMode && (
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedIds.includes(u.id) ? 'bg-[#FF3B30] border-[#FF3B30] text-white' : 'border-slate-300 bg-slate-50'}`}>
                                                        {selectedIds.includes(u.id) && <CheckSquare size={14} />}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-[15px] group-hover:text-[#0066CC] transition-colors">{u.name}</h4>
                                                    <div className="flex gap-6 mt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                        <span>Role: <span className="text-[#0066CC]">{u.role?.name || 'N/A'}</span></span>
                                                        <span>Project: <span className="text-[#0066CC]">{u.projects?.length > 0 ? u.projects.map(p => p.name).join(', ') : 'Unassigned'}</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(u.id, u.isActive); }} 
                                                disabled={isDeleteMode}
                                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${u.isActive ? 'bg-[#00B69B] text-white' : 'bg-red-500 text-white'} ${isDeleteMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {filteredRoles.length === 0 ? (
                                        <p className="col-span-2 text-center py-10 text-slate-400 font-bold">No roles found.</p>
                                    ) : filteredRoles.map(r => (
                                        <div 
                                            key={r.id} 
                                            onClick={() => { if (isDeleteMode) toggleSelection(r.id); }} 
                                            className={`flex justify-between items-start p-6 border rounded-2xl transition-all cursor-pointer group bg-white ${selectedIds.includes(r.id) ? 'border-red-400 shadow-sm bg-red-50/30' : 'border-slate-100 hover:border-blue-100 hover:shadow-sm'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {isDeleteMode && (
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 transition-all ${selectedIds.includes(r.id) ? 'bg-[#FF3B30] border-[#FF3B30] text-white' : 'border-slate-300 bg-slate-50'}`}>
                                                        {selectedIds.includes(r.id) && <CheckSquare size={14} />}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-[15px] group-hover:text-[#0066CC] transition-colors">{r.name}</h4>
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-3">Assigned Users: <span className="text-[#0066CC]">{r.stats?.users || 0}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* CREATION & DETAILS MODALS */}
            <CreateUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} roles={roles} projects={projects} onSuccess={fetchAllData} />
            <CreateRoleModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} projects={projects} onSuccess={fetchAllData} />
            <UserDetailsModal isOpen={isUserDetailsOpen} onClose={() => setIsUserDetailsOpen(false)} user={selectedUser} />

            {/* DELETE CONFIRMATION MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-[320px] rounded-3xl shadow-2xl p-8 flex flex-col items-center animate-in zoom-in duration-200">
                        <h3 className="text-lg font-black text-slate-800 text-center mb-8 leading-tight">
                            Are you sure you want to delete the {activeSubTab === 'users' ? 'User' : 'Role'}{selectedIds.length > 1 ? 's' : ''}?
                        </h3>
                        <button 
                            onClick={confirmDelete} 
                            className="w-full py-3.5 bg-[#FF3B30] text-white font-black text-[15px] rounded-2xl mb-4 hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                        >
                            Delete
                        </button>
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)} 
                            className="text-[#FF3B30] font-bold text-sm hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* LOGOUT CONFIRMATION MODAL */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center animate-in zoom-in duration-200">
                        <header className="w-full flex justify-end mb-4">
                            <button onClick={() => setIsLogoutModalOpen(false)} className="p-1.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
                                <X size={16}/>
                            </button>
                        </header>
                        
                        <div className="p-4 bg-red-50 text-[#FF3B30] rounded-full mb-6">
                            <LogOut size={28}/>
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-800 text-center mb-2 leading-tight">Ready to leave?</h3>
                        <p className="text-slate-500 text-sm font-bold text-center mb-10">You will need to enter your credentials to log in again.</p>
                        
                        <div className="flex gap-4 w-full">
                            <button onClick={() => setIsLogoutModalOpen(false)} className="w-1/2 py-4 border border-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleLogout} className="w-1/2 py-4 bg-[#FF3B30] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#e63228] transition-all shadow-md shadow-red-100">
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageUsersRoles;