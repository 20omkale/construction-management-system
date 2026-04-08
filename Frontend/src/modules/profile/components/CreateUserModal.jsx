import React, { useState } from 'react';
import { X, Loader2, ArrowLeft } from 'lucide-react';
import { createUserAPI } from '../services/user.service';

const CreateUserModal = ({ isOpen, onClose, roles, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        employeeId: '', 
        roleId: '', 
        name: '', 
        email: '', 
        phone: '', 
        designation: 'Staff', 
        department: 'Operations',
        aadharNumber: '' 
    });

    if (!isOpen) return null;

    // 🚨 NEW: Strictly allow only numbers and max 12 characters
    const handleAadhaarChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Strips out any non-numeric characters
        if (value.length <= 12) {
            setFormData({ ...formData, aadharNumber: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🚨 NEW: Validation check before hitting the API
        if (formData.aadharNumber && formData.aadharNumber.length !== 12) {
            alert("Aadhaar Number must be exactly 12 digits.");
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Send pure JSON to the backend exactly as Siddharth's controller expects
            const payload = {
                ...formData,
                salaryType: 'MONTHLY'
            };

            await createUserAPI(payload);
            
            // Clean up and close on success
            setFormData({ 
                employeeId: '', roleId: '', name: '', email: '', phone: '', 
                designation: 'Staff', department: 'Operations', aadharNumber: '' 
            });
            
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.message || "Failed to create user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                
                <div className="px-8 py-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors">
                                <ArrowLeft size={20} strokeWidth={2.5} />
                            </button>
                            <h2 className="text-2xl font-black text-slate-800">Create New User</h2>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-8">System Admin Creation</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Name <span className="text-red-500">*</span></label>
                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#0066CC] outline-none transition-all" placeholder="e.g. Rahul Sharma" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address <span className="text-red-500">*</span></label>
                            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#0066CC] outline-none transition-all" placeholder="rakesh.sharma@abc.com" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number <span className="text-red-500">*</span></label>
                            <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#0066CC] outline-none transition-all" placeholder="+91 91234 56789" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">User ID <span className="text-red-500">*</span></label>
                            <input required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#0066CC] outline-none transition-all" placeholder="SYS-ADM-001" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Assigned <span className="text-red-500">*</span></label>
                            <select required value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#0066CC] outline-none transition-all appearance-none cursor-pointer">
                                <option value="">Select Role...</option>
                                {roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar Number</label>
                            <input 
                                type="text" 
                                value={formData.aadharNumber} 
                                onChange={handleAadhaarChange} // 🚨 NEW: Custom handler applied here
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#0066CC] outline-none transition-all" 
                                placeholder="e.g. 123456789012" 
                            />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-center">
                        <button type="submit" disabled={isSubmitting} className="px-20 py-4 bg-[#0066CC] text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-blue-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:translate-y-0">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;