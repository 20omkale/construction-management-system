import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Clock, FileText, CheckSquare, IndianRupee, Calendar, Box } from 'lucide-react';
import ProjectInventoryTab from '../components/ProjectInventoryTab'; 
import WPRListPage from './WPRListPage'; // Your WPR List Module
import DPRListPage from './DPRListPage'; // Your DPR List Module

const ProjectDetails = () => {
    // Extracts the real ID from the URL
    const { id } = useParams(); 
    
    // State for the main tabs
    const [activeTab, setActiveTab] = useState('dpr'); 

    // State for the Sub-Tabs (DPR vs WPR)
    const [activeSubTab, setActiveSubTab] = useState('dpr');

    return (
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans animate-in fade-in duration-500 bg-[#F8FAFC] min-h-screen">
            
            {/* Dynamic Breadcrumbs */}
            <div className="flex items-center gap-2 text-[14px] font-bold text-gray-900 mb-2">
                <Link to="/projects" className="hover:text-[#0066CC] transition-colors">Projects</Link>
                <span className="text-gray-400">›</span>
                <span className="text-gray-500">Project Details</span>
                <span className="text-gray-400">›</span>
                <span className="capitalize text-[#0066CC]">
                    {activeTab === 'dpr' ? 'Reports' : activeTab}
                </span>
            </div>

            {/* TOP HEADER SECTION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                    <div>
                        <h1 className="text-[26px] font-black text-gray-900 leading-tight">Site A — Residential Block</h1>
                        <p className="text-[13px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                            Mumbai | ID-{id?.substring(0, 8) || '2341'} · ABC Infrastructure Pvt Ltd
                        </p>
                        
                        <div className="flex items-center gap-4 mt-5 text-[12px] font-black">
                            <span className="bg-[#FF9500] text-white px-4 py-1 rounded-full text-[10px] uppercase tracking-widest">Ongoing</span>
                            <span className="text-gray-500 uppercase tracking-tighter">Priority: <span className="text-red-500">High</span></span>
                            <span className="text-gray-200">|</span>
                            <span className="text-gray-500">Start: 12 Jan 2026</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-gray-500">End: 13 Oct 2026</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl text-[13px] font-black text-gray-700 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
                            <Edit size={16} strokeWidth={2.5} /> EDIT
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 border border-red-100 bg-red-50 rounded-2xl text-[13px] font-black text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm">
                            <Trash2 size={16} strokeWidth={2.5} /> DELETE
                        </button>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
                        <p className="text-[26px] font-black text-slate-900 leading-none">₹42L<span className="text-[16px] text-slate-300 font-bold">/₹80L</span></p>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Budget used</p>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
                        <p className="text-[26px] font-black text-slate-900 leading-none">124</p>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Days Left</p>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
                        <p className="text-[26px] font-black text-slate-900 leading-none">18<span className="text-[16px] text-slate-300 font-bold">/30</span></p>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Tasks Done</p>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Project Health</p>
                         <p className="text-[12px] font-black text-[#0066CC]">75% COMPLETE</p>
                    </div>
                    <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                        <div className="bg-[#0066CC] h-full rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar bg-white">
                    {[
                        { id: 'overview', label: 'Overview', icon: Eye },
                        { id: 'attendance', label: 'Attendance', icon: Clock },
                        { id: 'dpr', label: 'DPR', icon: FileText },
                        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                        { id: 'transactions', label: 'Transactions', icon: IndianRupee },
                        { id: 'timeline', label: 'Timeline', icon: Calendar },
                        { id: 'inventory', label: 'Inventory', icon: Box },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-8 py-5 text-[13px] font-black uppercase tracking-widest border-b-[3px] transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? 'border-[#0066CC] text-[#0066CC] bg-blue-50/30' 
                                    : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT RENDERING */}
                <div className="p-8 bg-[#FCFDFF] min-h-[600px]">
                    {activeTab === 'overview' && <div className="flex items-center justify-center py-40 text-gray-300 font-bold uppercase tracking-widest italic">Overview Analytics Coming Soon</div>}
                    {activeTab === 'attendance' && <div className="flex items-center justify-center py-40 text-gray-300 font-bold uppercase tracking-widest italic">Attendance Logs Coming Soon</div>}
                    
                    {/* WIRED: PROGRESS REPORTS TAB (DPR & WPR TOGGLE) */}
                    {activeTab === 'dpr' && (
                        <div className="animate-in fade-in duration-300">
                            
                            {/* FIGMA SUB-TAB TOGGLE SWITCH */}
                            <div className="flex bg-slate-100 w-fit p-1.5 rounded-full mb-8 shadow-inner border border-slate-200/50">
                                <button 
                                    onClick={() => setActiveSubTab('dpr')}
                                    className={`px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                        activeSubTab === 'dpr' 
                                            ? 'bg-[#0066CC] text-white shadow-md' 
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    DPR
                                </button>
                                <button 
                                    onClick={() => setActiveSubTab('wpr')}
                                    className={`px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                        activeSubTab === 'wpr' 
                                            ? 'bg-[#0066CC] text-white shadow-md' 
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    WPR
                                </button>
                            </div>

                            {/* Render the correct list based on the active sub-tab */}
                            {activeSubTab === 'dpr' ? (
                                <div className="animate-in slide-in-from-bottom-4 duration-500">
                                    <DPRListPage projectId={id} />
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-bottom-4 duration-500">
                                    <WPRListPage projectId={id} />
                                </div>
                            )}

                        </div>
                    )}
                    
                    {activeTab === 'tasks' && <div className="flex items-center justify-center py-40 text-gray-300 font-bold uppercase tracking-widest italic">Task Management Coming Soon</div>}
                    {activeTab === 'transactions' && <div className="flex items-center justify-center py-40 text-gray-300 font-bold uppercase tracking-widest italic">Financial Transactions Coming Soon</div>}
                    {activeTab === 'timeline' && <div className="flex items-center justify-center py-40 text-gray-300 font-bold uppercase tracking-widest italic">Timeline Roadmap Coming Soon</div>}
                    
                    {/* INVENTORY TAB */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-10 shadow-sm">
                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-[14px] border-[#0066CC] opacity-10"></div>
                                        <div className="absolute inset-0 rounded-full border-[14px] border-[#0066CC] border-r-[#00B69B] border-b-[#00B69B]"></div>
                                        <Box className="text-[#0066CC]" size={24} />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-400">EQUIPMENT:</span> <span className="text-[#00B69B] font-black">₹30,35,000</span></div>
                                        <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-400">MATERIAL:</span> <span className="text-[#0066CC] font-black">₹18,40,000</span></div>
                                        <div className="flex justify-between text-[15px] font-black border-t border-slate-50 pt-4"><span className="text-slate-900">TOTAL STOCK:</span> <span className="text-slate-900">₹48,75,000</span></div>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Inventory Budget Utilization</p>
                                    <div className="w-full bg-slate-50 h-5 rounded-full overflow-hidden mb-4 border border-slate-100 p-1">
                                        <div className="bg-[#0066CC] h-full rounded-full shadow-lg transition-all duration-1000" style={{ width: '60%' }}></div>
                                    </div>
                                    <div className="flex justify-between text-[12px] font-bold">
                                        <p className="text-slate-500">ALLOCATED: <span className="text-slate-900 font-black">₹20,00,000</span></p>
                                        <p className="text-slate-500">AVAILABLE: <span className="text-[#00B69B] font-black">₹8,00,000</span></p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-2">
                                <ProjectInventoryTab projectId={id} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;