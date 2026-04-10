import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const CreateDPRModal = ({ isOpen, onClose, projectId, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);

    const [dropdownData, setDropdownData] = useState({
        visitors: [],
        tasks: [],
        inventory: [],
        subcontractors: []
    });

    const [formData, setFormData] = useState({
        dprDate: '',
        visitorId: '',
        description: '',
        weather: 'Sunny',
        workersCount: '',
        staffCount: '',
        notes: ''
    });

    const [completedTasks, setCompletedTasks] = useState(['']);
    const [selectedSubcontractors, setSelectedSubcontractors] = useState(['']);
    const [nextDayTasks, setNextDayTasks] = useState(['']);
    const [materialsUsed, setMaterialsUsed] = useState([{ materialId: '', quantity: 1 }]);
    const [equipmentsUsed, setEquipmentsUsed] = useState([{ equipmentId: '', hrsUsed: 1 }]);

    const [sitePhotos, setSitePhotos] = useState([]);
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        if (isOpen && projectId) {
            const fetchModalData = async () => {
                setIsFetchingData(true);
                try {
                    const token = localStorage.getItem('accessToken');
                    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
                    const headers = { Authorization: `Bearer ${token}` };

                    // 🚨 UPDATE: Added projectId to ensure we only get items for THIS project
                    const [teamRes, tasksRes, invRes, subsRes] = await Promise.allSettled([
                        axios.get(`${BASE_URL}/api/v1/projects/${projectId}/team`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/tasks?projectId=${projectId}`, { headers }), 
                        axios.get(`${BASE_URL}/api/v1/inventory?projectId=${projectId}`, { headers }), 
                        axios.get(`${BASE_URL}/api/v1/subcontractors?projectId=${projectId}`, { headers })
                    ]);

                    const extractData = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];

                    setDropdownData({
                        visitors: extractData(teamRes),
                        tasks: extractData(tasksRes),
                        inventory: extractData(invRes), 
                        subcontractors: extractData(subsRes)
                    });
                } catch (error) {
                    console.error("Failed to load dropdown data:", error);
                } finally {
                    setIsFetchingData(false);
                }
            };
            fetchModalData();
        } else {
            setSitePhotos([]);
            setDocuments([]);
            setFormData({
                dprDate: '', visitorId: '', description: '', weather: 'Sunny', workersCount: '', staffCount: '', notes: ''
            });
            setCompletedTasks(['']);
            setSelectedSubcontractors(['']);
            setNextDayTasks(['']);
            setMaterialsUsed([{ materialId: '', quantity: 1 }]);
            setEquipmentsUsed([{ equipmentId: '', hrsUsed: 1 }]);
        }
    }, [isOpen, projectId]);

    if (!isOpen) return null;

    const updateList = (setter, index, value) => setter(prev => { const n = [...prev]; n[index] = value; return n; });
    const addToList = (setter) => setter(prev => [...prev, '']);
    const removeFromList = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

    const updateObjectList = (setter, index, field, value) => setter(prev => { const n = [...prev]; n[index][field] = value; return n; });
    const addObjectToList = (setter, defaultObj) => setter(prev => [...prev, defaultObj]);

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
            
            const payload = {
                projectId,
                date: formData.dprDate,
                visitorId: formData.visitorId,
                workDescription: formData.description,
                weather: formData.weather,
                workersCount: Number(formData.workersCount),
                staffCount: Number(formData.staffCount),
                notes: formData.notes,
                completedWork: JSON.stringify(completedTasks.filter(t => t !== '')),
                subcontractors: JSON.stringify(selectedSubcontractors.filter(s => s !== '')),
                nextDayTasks: JSON.stringify(nextDayTasks.filter(t => t !== '')),
                materialsUsed: JSON.stringify(materialsUsed.filter(m => m.materialId !== '')),
                equipmentsUsed: JSON.stringify(equipmentsUsed.filter(eq => eq.equipmentId !== ''))
            };

            const dprResponse = await axios.post(`${BASE_URL}/api/v1/dpr`, payload, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            const newDprId = dprResponse.data?.data?.id || dprResponse.data?.id;

            if (newDprId && (sitePhotos.length > 0 || documents.length > 0)) {
                const allFiles = [...sitePhotos, ...documents];
                const uploadPromises = [];

                for (const file of allFiles) {
                    const photoData = new FormData();
                    photoData.append('dprId', newDprId);
                    photoData.append('file', file); 
                    photoData.append('title', file.name); 

                    uploadPromises.push(
                        axios.post(`${BASE_URL}/api/v1/dpr-photos/upload`, photoData, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                    );
                }

                const results = await Promise.allSettled(uploadPromises);
                const failedUploads = results.filter(r => r.status === 'rejected');
                
                if (failedUploads.length > 0) {
                    console.error("Media Upload Failures:", failedUploads);
                    const errorMessage = failedUploads[0].reason?.response?.data?.message || "Unknown Multer Error";
                    alert(`DPR Created, but media failed to upload! Backend says: "${errorMessage}"`);
                }
            }
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Submission Error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to create DPR. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200 h-[90vh] relative">
                
                {isFetchingData && (
                    <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
                        <Loader2 className="w-10 h-10 text-[#0066CC] animate-spin mb-4" />
                        <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Loading Site Data...</p>
                    </div>
                )}

                <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 shrink-0">
                    <h2 className="text-xl font-black text-slate-800">Create DPR</h2>
                    <button onClick={onClose} disabled={isFetchingData} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8">
                    <form id="dpr-form" onSubmit={handleSubmit} className="space-y-8">
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">DPR Date</label>
                                <input type="date" required value={formData.dprDate} onChange={e => setFormData({...formData, dprDate: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-[#0066CC] outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Visitor</label>
                                <select required value={formData.visitorId} onChange={e => setFormData({...formData, visitorId: e.target.value})} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC] transition-all cursor-pointer">
                                    <option value="">Select visitor</option>
                                    {dropdownData.visitors.map(v => (
                                        <option key={v.id || v._id || v.userId} value={v.id || v._id || v.userId}>{v.name || v.fullName || 'Unnamed Visitor'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Description</label>
                            <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Enter the description" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-[#0066CC] outline-none transition-all resize-none"></textarea>
                        </div>

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

                        <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Daily Attendance</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2">
                                    <span className="text-xs font-bold text-slate-500 w-16">Workers</span>
                                    <input type="number" required value={formData.workersCount} onChange={e => setFormData({...formData, workersCount: e.target.value})} className="w-full text-right text-sm font-black text-slate-800 outline-none" placeholder="0" min="0" />
                                </div>
                                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2">
                                    <span className="text-xs font-bold text-slate-500 w-16">Staff</span>
                                    <input type="number" required value={formData.staffCount} onChange={e => setFormData({...formData, staffCount: e.target.value})} className="w-full text-right text-sm font-black text-slate-800 outline-none" placeholder="0" min="0" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Tasks Completed</label>
                            {completedTasks.map((task, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <select value={task} onChange={(e) => updateList(setCompletedTasks, index, e.target.value)} className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]">
                                        <option value="">Select task</option>
                                        {dropdownData.tasks.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name || t.taskName}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeFromList(setCompletedTasks, index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList(setCompletedTasks)} className="w-full py-3 border-2 border-dashed border-[#0066CC]/30 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">
                                + Add Task
                            </button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Consumed Materials</label>
                            {materialsUsed.map((material, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <select value={material.materialId} onChange={(e) => updateObjectList(setMaterialsUsed, index, 'materialId', e.target.value)} className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]">
                                        <option value="">Select material from inventory</option>
                                        {dropdownData.inventory.map(m => <option key={m.id || m._id} value={m.id || m._id}>{m.name || m.itemName}</option>)}
                                    </select>
                                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
                                        <button type="button" onClick={() => updateObjectList(setMaterialsUsed, index, 'quantity', Math.max(1, material.quantity - 1))} className="px-3 py-3 text-[#0066CC] hover:bg-blue-50 font-bold">-</button>
                                        <input type="number" value={material.quantity} onChange={(e) => updateObjectList(setMaterialsUsed, index, 'quantity', Number(e.target.value))} className="w-10 text-center text-sm font-bold text-slate-800 outline-none" min="1" />
                                        <button type="button" onClick={() => updateObjectList(setMaterialsUsed, index, 'quantity', material.quantity + 1)} className="px-3 py-3 text-[#0066CC] hover:bg-blue-50 font-bold">+</button>
                                    </div>
                                    <button type="button" onClick={() => removeFromList(setMaterialsUsed, index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addObjectToList(setMaterialsUsed, { materialId: '', quantity: 1 })} className="w-full py-3 border-2 border-dashed border-[#0066CC]/30 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">
                                + Add Material
                            </button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Equipments Used (Hrs)</label>
                            {equipmentsUsed.map((equipment, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <select value={equipment.equipmentId} onChange={(e) => updateObjectList(setEquipmentsUsed, index, 'equipmentId', e.target.value)} className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]">
                                        <option value="">Select equipment from inventory</option>
                                        {dropdownData.inventory.map(eq => <option key={eq.id || eq._id} value={eq.id || eq._id}>{eq.name || eq.itemName}</option>)}
                                    </select>
                                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
                                        <button type="button" onClick={() => updateObjectList(setEquipmentsUsed, index, 'hrsUsed', Math.max(1, equipment.hrsUsed - 1))} className="px-3 py-3 text-[#0066CC] hover:bg-blue-50 font-bold">-</button>
                                        <input type="number" value={equipment.hrsUsed} onChange={(e) => updateObjectList(setEquipmentsUsed, index, 'hrsUsed', Number(e.target.value))} className="w-10 text-center text-sm font-bold text-slate-800 outline-none" min="1" />
                                        <button type="button" onClick={() => updateObjectList(setEquipmentsUsed, index, 'hrsUsed', equipment.hrsUsed + 1)} className="px-3 py-3 text-[#0066CC] hover:bg-blue-50 font-bold">+</button>
                                    </div>
                                    <button type="button" onClick={() => removeFromList(setEquipmentsUsed, index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addObjectToList(setEquipmentsUsed, { equipmentId: '', hrsUsed: 1 })} className="w-full py-3 border-2 border-dashed border-[#0066CC]/30 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">
                                + Add Equipment
                            </button>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Sub-contractors On Site</label>
                            {selectedSubcontractors.map((sub, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <select value={sub} onChange={(e) => updateList(setSelectedSubcontractors, index, e.target.value)} className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]">
                                        <option value="">Select sub-contractor</option>
                                        {dropdownData.subcontractors.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name || s.companyName}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeFromList(setSelectedSubcontractors, index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList(setSelectedSubcontractors)} className="w-full py-3 border-2 border-dashed border-[#0066CC]/30 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">
                                + Add Sub-contractor
                            </button>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Upload Site Photos</label>
                                <label className="flex flex-col items-center justify-center w-full py-8 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                                    <ImageIcon className="text-[#0066CC] mb-2" size={24} />
                                    <span className="text-sm font-bold text-[#0066CC]">Click to upload</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">JPG, PNG up to 10MB each</span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'photos')} />
                                </label>
                                
                                {/* 🖼️ Real-time Image Thumbnail Preview Grid */}
                                {sitePhotos.length > 0 && (
                                    <div className="flex gap-4 overflow-x-auto mt-4 pb-3 pt-3 pr-3">
                                        {sitePhotos.map((file, i) => (
                                            <div key={i} className="relative w-20 h-20 shrink-0 group">
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    alt="preview" 
                                                    className="w-full h-full object-cover rounded-xl border-2 border-slate-200 shadow-sm"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFile(i, 'photos')} 
                                                    className="absolute -top-2 -right-2 bg-white border border-slate-200 text-red-500 rounded-full p-1 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={12}/>
                                                </button>
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
                                
                                {/* 📄 Real-time Document Tile Preview Grid */}
                                {documents.length > 0 && (
                                    <div className="flex gap-4 overflow-x-auto mt-4 pb-3 pt-3 pr-3">
                                        {documents.map((file, i) => (
                                            <div key={i} className="relative w-20 h-20 shrink-0 bg-[#F8FAFC] border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center group shadow-sm">
                                                <FileText className="text-blue-500 mb-1" size={20} />
                                                <span className="text-[8px] font-bold text-slate-600 truncate w-full px-2 text-center" title={file.name}>{file.name}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeFile(i, 'documents')} 
                                                    className="absolute -top-2 -right-2 bg-white border border-slate-200 text-red-500 rounded-full p-1 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={12}/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest ml-1">Next Day Planning</label>
                            {nextDayTasks.map((task, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <select value={task} onChange={(e) => updateList(setNextDayTasks, index, e.target.value)} className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]">
                                        <option value="">Select task for tomorrow</option>
                                        {dropdownData.tasks.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name || t.taskName}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeFromList(setNextDayTasks, index)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addToList(setNextDayTasks)} className="w-full py-3 border-2 border-dashed border-[#0066CC]/30 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">
                                + Add Task
                            </button>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
                            <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Add any notes or observations..." className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-[#0066CC] outline-none transition-all resize-none"></textarea>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 shrink-0 flex justify-center bg-white z-10">
                    <button form="dpr-form" type="submit" disabled={isSubmitting || isFetchingData} className="px-20 py-4 bg-[#0066CC] text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-blue-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create DPR'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateDPRModal;