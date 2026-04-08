import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
    // If modal is closed or no user is selected, render nothing
    if (!isOpen || !user) return null;

    // Safely extract projects into a comma-separated string
    const projectsAssigned = user.projects?.length > 0 
        ? user.projects.map(p => p.name).join(', ') 
        : 'Unassigned';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                
                {/* Header Section */}
                <div className="px-8 py-8 relative">
                    {/* Close Button */}
                    <button 
                        onClick={onClose} 
                        className="absolute right-6 top-6 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-start gap-4">
                        <button 
                            onClick={onClose} 
                            className="mt-1 text-slate-400 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft size={24} strokeWidth={2.5} />
                        </button>
                        
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {user.name || 'N/A'}
                            </h2>
                            <p className="text-[13px] font-bold text-slate-500">
                                User ID: {user.employeeId || 'N/A'}
                            </p>
                            <p className="text-[13px] font-bold text-slate-500">
                                {user.company?.name || 'ABC Infrastructure Pvt Ltd'}
                            </p>
                            <p className="text-sm font-black text-[#0066CC] pt-1">
                                {user.role?.name || 'No Role Assigned'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Grid Section */}
                <div className="p-8 pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-y-8 gap-x-8">
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Name
                            </label>
                            <p className="text-[15px] font-bold text-slate-800">
                                {user.name || 'N/A'}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Email Address
                            </label>
                            <p className="text-[15px] font-bold text-slate-800">
                                {user.email || 'N/A'}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Mobile Number
                            </label>
                            <p className="text-[15px] font-bold text-slate-800">
                                {user.phone || 'N/A'}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Project assigned
                            </label>
                            <p className="text-[15px] font-bold text-slate-800">
                                {projectsAssigned}
                            </p>
                        </div>
                        
                        {/* Rendered as text since backend uses aadharNumber, not file upload */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Aadhaar Number
                            </label>
                            <p className="text-[15px] font-bold text-slate-800">
                                {user.aadharNumber || 'Not provided'}
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDetailsModal;