import React, { useState } from 'react';
import { X, Loader2, Trash2, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const CreateDPRModal = ({ isOpen, onClose, projectId, visitors = [], tasks = [], subcontractors = [], onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        dprDate: '',
        visitorId: '',
        description: '',
        weather: 'Sunny',
        workersCount: '',
        staffCount: ''
    });

    // Dynamic Lists
    const [completedTasks, setCompletedTasks] = useState(['']);
    const [selectedSubcontractors, setSelectedSubcontractors] = useState(['']);
    const [nextDayTasks, setNextDayTasks] = useState(['']);

    // Files
    const [sitePhotos, setSitePhotos] = useState([]);
    const [documents, setDocuments] = useState([]);

    if (!isOpen) return null;

    // --- Dynamic List Handlers ---
    const updateList = (setter, index, value) => {
        setter(prev => {
            const newList = [...prev];
            newList[index] = value;
            return newList;
        });
    };

    const addToList = (setter) => setter(prev => [...prev, '']);
    const removeFromList = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

    // --- File Handlers ---
    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'photos') setSitePhotos(prev => [...prev, ...files]);
        if (type === 'documents') setDocuments(prev => [...prev, ...files]);
    };

    const removeFile = (index, type) => {
        if (type === 'photos') setSitePhotos(prev => prev.filter((_, i) => i !== index));
        if (type === 'documents') setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const token = localStorage.getItem('accessToken');
            const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
            
            // 🚨 DPR MUST USE FORMDATA BECAUSE IT HAS FILE UPLOADS
            const submitData = new FormData();
            submitData.append('projectId', projectId);
            submitData.append('dprDate', formData.dprDate);
            submitData.append('visitorId', formData.visitorId);
            submitData.append('description', formData.description);
            submitData.append('weather', formData.weather);
            submitData.append('workersCount', formData.workersCount);
            submitData.append('staffCount', formData.staffCount);
            
            // Append arrays properly
            submitData.append('completedTasks', JSON.stringify(completedTasks.filter(t => t !== '')));
            submitData.append('subcontractors', JSON.stringify(selectedSubcontractors.filter(s => s !== '')));
            submitData.append('nextDayTasks', JSON.stringify(nextDayTasks.filter(t => t !== '')));

            // Append Files (matches Siddharth's backend upload controller)
            sitePhotos.forEach(photo => submitData.append('sitePhotos', photo));
            documents.forEach(doc => submitData.append('documents', doc));

            await axios.post(`${BASE_URL}/api/v1/dpr`, submitData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // Required for files
                }
            });
            
            // 🚨 Call onSuccess to refresh the list in the parent component
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create DPR.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200 h-[90vh]">
                
                <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 shrink-0">
                    <h2 className="text-xl font-black text-slate-800">Create DPR</h2>
                    <button onClick={onClose} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8">
                    <form id="dpr-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Date & Visitor */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">DPR Date</label>
                                <input type="date" required value={formData.dprDate} onChange={e => setFormData({...formData, dprDate: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-[#0066CC] outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Visitor</label>
                                <select value={formData.visitorId} onChange={e => setFormData({...formData, visitorId: e.target.value})} className="w-full px-5 py-3.5 bg-[#0066CC] border border-[#0066CC] rounded-2xl text-sm font-bold text-white outline-none transition-all cursor-pointer">
                                    <option value="">Select visitor</option>
                                    {/* 🚨 SAFE MAPPING: Checks for multiple key possibilities to prevent empty dropdowns */}
                                    {visitors.map(v => (
                                        <option key={v.id || v._id} value={v.id || v._id}>
                                            {v.name || v.fullName || v.visitorName || 'Unnamed Visitor'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Enter the description" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-[#0066CC] outline-none transition-all resize-none"></textarea>
                        </div>

                        {/* Weather */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Weather</label>
                            <div className="flex gap-3">
                                {['Sunny', 'Cloudy', 'Rainy'].map(w => (
                                    <button key={w} type="button" onClick={() => setFormData({...formData, weather: w})} className={`px-6 py-2.5 rounded-full text-xs font-black transition-all border ${formData.weather === w ? 'bg-blue-50 border-[#0066CC] text-[#0066CC]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Attendance */}
                        <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Attendance</label>
                                <span className="text-[10px] font-black text-[#0066CC] uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded-full">18/30 Present</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2">
                                    <span className="text-xs font-bold text-slate-500 w-16">Workers</span>
                                    <input type="number" required value={formData.workersCount} onChange={e => setFormData({...formData, workersCount: e.target.value})} className="w-full text-right text-sm font-black text-slate-800 outline-none" placeholder="0" />
                                </div>
                                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2">
                                    <span className="text-xs font-bold text-slate-500 w-16">Staff</span>
                                    <input type="number" required value={formData.staffCount} onChange={e => setFormData({...formData, staffCount: e.target.value})} className="w-full text-right text-sm font-black text-slate-800 outline-none" placeholder="0" />
                                </div>
                            </div>
                        </div>

                        {/* Tasks Completed */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Tasks Completed</label>
                            {completedTasks.map((task, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <select value={task} onChange={(e) => updateList(setCompletedTasks, index, e.target.value)} className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]">
                                        <option value="">Select task</option>
                                        {/* 🚨 SAFE MAPPING */}
                                        {tasks.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name || t.taskName}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeFromList(setCompletedTasks, index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>

                        {/* Sub Contractors */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Sub-contractors</label>
                            {selectedSubcontractors.map((sub, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <select value={sub} onChange={(e) => updateList(setSelectedSubcontractors, index, e.target.value)} className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]">
                                        <option value="">Select sub-contractor</option>
                                        {/* 🚨 SAFE MAPPING */}
                                        {subcontractors.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name || s.companyName}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeFromList(setSelectedSubcontractors, index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList(setSelectedSubcontractors)} className="w-full py-3 border-2 border-dashed border-[#0066CC]/30 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">
                                + Add Sub-contractor
                            </button>
                        </div>

                        {/* File Uploads - Restored fully with FormData logic */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Upload Site Photos</label>
                                <label className="flex flex-col items-center justify-center w-full py-8 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                                    <ImageIcon className="text-[#0066CC] mb-2" size={24} />
                                    <span className="text-sm font-bold text-[#0066CC]">Click to upload</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">JPG, PNG up to 10MB each</span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'photos')} />
                                </label>
                                {sitePhotos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {sitePhotos.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700">
                                                <span className="truncate max-w-[100px]">{file.name}</span>
                                                <button type="button" onClick={() => removeFile(i, 'photos')} className="text-red-500"><X size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Upload Documents</label>
                                <label className="flex flex-col items-center justify-center w-full py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                    <FileText className="text-[#0066CC] mb-2" size={24} />
                                    <span className="text-sm font-bold text-[#0066CC]">Click to upload</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">PDF, DOC up to 10MB each</span>
                                    <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'documents')} />
                                </label>
                                {documents.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {documents.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700">
                                                <span className="truncate max-w-[100px]">{file.name}</span>
                                                <button type="button" onClick={() => removeFile(i, 'documents')} className="text-red-500"><X size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Next Day Planning */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Next Day Planning</label>
                            {nextDayTasks.map((task, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <select value={task} onChange={(e) => updateList(setNextDayTasks, index, e.target.value)} className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]">
                                        <option value="">Select task for tomorrow</option>
                                        {/* 🚨 SAFE MAPPING */}
                                        {tasks.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name || t.taskName}</option>)}
                                    </select>
                                    
                                    {/* 🚨 FIXED: Trash icon properly added back to Next Day tasks */}
                                    <button type="button" onClick={() => removeFromList(setNextDayTasks, index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList(setNextDayTasks)} className="w-full py-3 border-2 border-dashed border-[#0066CC]/30 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">
                                + Add Task
                            </button>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 shrink-0 flex justify-center bg-white">
                    <button form="dpr-form" type="submit" disabled={isSubmitting} className="px-20 py-4 bg-[#0066CC] text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-blue-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create DPR'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateDPRModal;