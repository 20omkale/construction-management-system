// src/modules/projects/pages/ProjectDetails.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Clock, FileText, CheckSquare, IndianRupee, Calendar, Box } from 'lucide-react';
import ProjectInventoryTab from '../components/ProjectInventoryTab'; // YOUR MODULE!

const ProjectDetails = () => {
    // In a real app, this ID comes from the URL after clicking a project in the list
    const { id = 'mock-id-123' } = useParams(); 
    
    // State for the tabs
    const [activeTab, setActiveTab] = useState('inventory'); // Defaulting to your tab for testing!

    return (
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans animate-in fade-in">
            
            {/* Dynamic Breadcrumbs */}
            <div className="flex items-center gap-2 text-[14px] font-bold text-gray-900 mb-2">
                <Link to="/projects" className="hover:text-[#0066CC]">Projects</Link>
                <span className="text-gray-400">›</span>
                <span className="text-gray-500">Project Details</span>
                <span className="text-gray-400">›</span>
                <span className="capitalize text-gray-500">{activeTab}</span>
            </div>

            {/* TOP HEADER SECTION (Matches Figma perfectly) */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-[24px] font-bold text-gray-900 leading-tight">Site A — Residential Block</h1>
                        <p className="text-[13px] text-gray-400 font-medium mt-1">Mumbai | ID-2341 · ABC Infrastructure Pvt Ltd</p>
                        
                        <div className="flex items-center gap-4 mt-4 text-[12px] font-bold">
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">Ongoing</span>
                            <span className="text-gray-500">Priority: <span className="text-red-500">High</span></span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500">Start: 12 Jan 2026</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-gray-500">End: 13 Oct 2026</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Edit size={16} /> Edit
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 border border-red-200 bg-red-50 rounded-xl text-[13px] font-bold text-red-500 hover:bg-red-100 transition-colors">
                            <Trash2 size={16} /> Delete
                        </button>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-3 gap-5 mb-6">
                    <div className="border border-gray-100 rounded-2xl p-5 text-center flex flex-col justify-center">
                        <p className="text-[24px] font-black text-gray-900 leading-none">₹42L<span className="text-[16px] text-gray-300 font-bold">/₹80L</span></p>
                        <p className="text-[12px] text-gray-500 font-medium mt-2">Budget used</p>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-5 text-center flex flex-col justify-center">
                        <p className="text-[24px] font-black text-gray-900 leading-none">124</p>
                        <p className="text-[12px] text-gray-500 font-medium mt-2">Days Left</p>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-5 text-center flex flex-col justify-center">
                        <p className="text-[24px] font-black text-gray-900 leading-none">18<span className="text-[16px] text-gray-300 font-bold">/30</span></p>
                        <p className="text-[12px] text-gray-500 font-medium mt-2">Tasks Done</p>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                        <div className="bg-[#0066CC] h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">75% complete</p>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar">
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
                            className={`flex items-center gap-2 px-6 py-4 text-[14px] font-bold border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? 'border-[#0066CC] text-[#0066CC]' 
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT RENDERING */}
                <div className="p-6 bg-[#FAFAFA] min-h-[500px]">
                    {activeTab === 'overview' && <div className="text-center py-20 text-gray-400">Overview Module (To be built by teammate)</div>}
                    {activeTab === 'attendance' && <div className="text-center py-20 text-gray-400">Attendance Module (To be built by teammate)</div>}
                    {activeTab === 'dpr' && <div className="text-center py-20 text-gray-400">DPR Module (To be built by teammate)</div>}
                    
                    {/* THIS IS WHERE YOUR MODULE IS INJECTED! */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            {/* Figma Inventory Summary Widgets (Donut Chart & Budget) */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-8 shadow-sm">
                                    <div className="w-24 h-24 rounded-full border-[12px] border-[#0066CC] border-r-[#00B69B] border-b-[#00B69B]"></div>
                                    <div className="space-y-3 flex-1">
                                        <div className="flex justify-between text-[13px] font-bold"><span className="text-gray-500">Equipment:</span> <span className="text-[#00B69B]">₹30,35,000</span></div>
                                        <div className="flex justify-between text-[13px] font-bold"><span className="text-gray-500">Material:</span> <span className="text-[#0066CC]">₹18,40,000</span></div>
                                        <div className="flex justify-between text-[13px] font-bold border-t border-gray-100 pt-2"><span className="text-gray-900">Inventory:</span> <span className="text-gray-900">₹48,75,000</span></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                    <p className="text-[14px] font-bold text-gray-900 mb-4">Budget</p>
                                    <div className="w-full bg-[#E5F0FA] h-5 rounded-full overflow-hidden mb-3">
                                        <div className="bg-[#0066CC] h-full rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                    <div className="flex justify-between text-[12px] font-medium text-gray-500">
                                        <p>Total Contract: <span className="font-bold text-gray-900">₹20,00,000</span></p>
                                        <p>Remaining: <span className="font-bold text-gray-900">₹8,00,000</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* YOUR TAB COMPONENT */}
                            <ProjectInventoryTab projectId={id} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;