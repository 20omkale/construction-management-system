import React, { useState } from 'react';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { createRoleAPI } from '../services/role.service';

const PERMISSION_MODULES = [
    { key: 'PROJECT', label: 'Projects' },
    { key: 'TASK', label: 'Tasks' },
    { key: 'ATTENDANCE', label: 'Attendance' },
    { key: 'TIMELINE', label: 'Timeline' },
    { key: 'MATERIAL', label: 'Materials' },
    { key: 'EXPENSE', label: 'Expenses' },
    { key: 'CONTRACTOR', label: 'Sub-contractor' },
    { key: 'REPORTS', label: 'Report' } 
];

const CreateRoleModal = ({ isOpen, onClose, projects, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    
    // UI Checkbox State (e.g., { PROJECT_VIEW: true, PROJECT_EDIT: true })
    const [permissions, setPermissions] = useState({});
    
    // Project Selection State
    const [currentProjectSelect, setCurrentProjectSelect] = useState('');
    const [allowedProjects, setAllowedProjects] = useState([]);

    if (!isOpen) return null;

    const handleAddProject = () => {
        if (currentProjectSelect && !allowedProjects.find(p => p.id === currentProjectSelect)) {
            const projectDetails = projects.find(p => p.id === currentProjectSelect);
            setAllowedProjects([...allowedProjects, projectDetails]);
            setCurrentProjectSelect('');
        }
    };

    const removeProject = (id) => {
        setAllowedProjects(allowedProjects.filter(p => p.id !== id));
    };

    const togglePermission = (moduleKey, action) => {
        const permKey = `${moduleKey}_${action}`;
        setPermissions(prev => ({ ...prev, [permKey]: !prev[permKey] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // 🚨 THE SMART MAPPER: Translates UI checkboxes to Database Permission Codes
        const finalPermissions = new Set();

        Object.keys(permissions).forEach(key => {
            if (permissions[key]) {
                const [mod, action] = key.split('_'); // splits 'PROJECT_VIEW' into 'PROJECT' and 'VIEW'
                
                // If they checked "View Only"
                if (action === 'VIEW') {
                    if (mod === 'REPORTS') finalPermissions.add('REPORTS_VIEW'); // Specific to your seed file
                    else finalPermissions.add(`${mod}_READ`);
                }
                
                // If they checked "Create / Edit"
                if (action === 'EDIT') {
                    finalPermissions.add(`${mod}_CREATE`);
                    finalPermissions.add(`${mod}_UPDATE`);
                    finalPermissions.add(`${mod}_DELETE`);
                    
                    // Module specific extra permissions from your seed file
                    if (mod === 'ATTENDANCE') finalPermissions.add('ATTENDANCE_VERIFY');
                    if (mod === 'EXPENSE') finalPermissions.add('EXPENSE_APPROVE');
                    if (mod === 'CONTRACTOR') {
                        finalPermissions.add('CONTRACTOR_VERIFY');
                        finalPermissions.add('CONTRACTOR_BLACKLIST');
                    }
                }
            }
        });

        // Convert the Set to an Array to send to the backend
        const permissionArray = Array.from(finalPermissions);

        try {
            await createRoleAPI({
                name: formData.name,
                description: formData.description,
                permissions: permissionArray // Sends the perfectly mapped array to the DB
            });
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.message || "Failed to create role.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl max-h-[95vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-[#0066CC] rounded-xl"><ShieldCheck size={20} /></div>
                        <h2 className="text-2xl font-black text-slate-800">Create Role</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    
                    <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Name</label>
                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-[#0066CC] outline-none transition-all" placeholder="Enter the role name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Description</label>
                            <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-[#0066CC] outline-none transition-all" placeholder="Enter the role description" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Projects Allowed</label>
                            <select value={currentProjectSelect} onChange={e => setCurrentProjectSelect(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-[#0066CC] focus:border-[#0066CC] outline-none transition-all appearance-none">
                                <option value="">Select project name...</option>
                                {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button type="button" onClick={handleAddProject} className="w-full mt-3 py-3 border-2 border-dashed border-blue-200 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-50 transition-all">
                                + Add Project
                            </button>
                            
                            {allowedProjects.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {allowedProjects.map(proj => (
                                        <div key={proj.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                                            <span className="text-xs font-bold text-slate-700">{proj.name}</span>
                                            <button type="button" onClick={() => removeProject(proj.id)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Access Permissions</label>
                        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="grid grid-cols-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 py-4 border-b border-slate-200">
                                <div>Module Name</div>
                                <div className="text-center">View Only</div>
                                <div className="text-center">Create / Edit</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {PERMISSION_MODULES.map((mod) => (
                                    <div key={mod.key} className="grid grid-cols-3 items-center px-6 py-4 hover:bg-blue-50/30 transition-colors">
                                        <span className="text-[13px] font-bold text-slate-700">{mod.label}</span>
                                        <div className="flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 accent-[#0066CC] cursor-pointer rounded-sm" 
                                                checked={!!permissions[`${mod.key}_VIEW`]} 
                                                onChange={() => togglePermission(mod.key, 'VIEW')} 
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 accent-[#0066CC] cursor-pointer rounded-sm" 
                                                checked={!!permissions[`${mod.key}_EDIT`]} 
                                                onChange={() => togglePermission(mod.key, 'EDIT')} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-center pb-4">
                        <button type="submit" disabled={isSubmitting} className="px-20 py-4 bg-[#0066CC] text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-blue-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:translate-y-0">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoleModal;