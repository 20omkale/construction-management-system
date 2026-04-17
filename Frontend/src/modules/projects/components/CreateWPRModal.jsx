import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Trash2, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { 
    getWeeklyReportPreview as getWPRPreviewAPI, 
    createWPR as createWPRAPI,
    getProjectInventory // 🚨 Import the fixed inventory function
} from '../services/project.service';

const SecureMediaFetcher = ({ file, getFileUrl, isDoc }) => {
    const [url, setUrl] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchMedia = async () => {
            const targetUrl = getFileUrl(file);
            if (!targetUrl) { if (isMounted) setError(true); return; }
            if (targetUrl.startsWith('blob:')) { if (isMounted) setUrl(targetUrl); return; }

            try {
                // Force axios to try and download via the URL (to handle cors/auth)
                const response = await axios.get(targetUrl, { responseType: 'blob' });
                if (isMounted) setUrl(URL.createObjectURL(response.data));
            } catch (e) {
                // Fallback to direct URL if blob fetch fails
                if (isMounted) setUrl(targetUrl);
            }
        };
        fetchMedia();
        return () => { isMounted = false; };
    }, [file, getFileUrl]);

    if (error) {
        return isDoc ? (
            <div className="aspect-square border border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-red-50 text-red-300 shadow-sm"><FileText className="w-6 h-6 mb-1" /><span className="text-[9px] font-bold">Failed</span></div>
        ) : (
            <div className="aspect-square border border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-red-50 text-red-300 shadow-sm"><ImageIcon className="w-6 h-6 mb-1" /><span className="text-[9px] font-bold">Missing</span></div>
        );
    }
    
    if (!url) return <div className="aspect-square flex items-center justify-center bg-slate-50 rounded-2xl shadow-sm"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>;

    if (isDoc) {
        const title = typeof file === 'string' ? file.split(/[/\\]/).pop() : (file.name || 'Document');
        return (
            <a href={url} target="_blank" rel="noreferrer" className="aspect-square bg-[#F8FAFC] rounded-2xl border border-slate-200 flex flex-col items-center justify-center hover:bg-blue-50 transition-all text-blue-500 p-2 text-center shadow-sm">
                <FileText size={24} className="mb-2" />
                <span className="text-[9px] font-bold text-slate-700 truncate w-full px-1">{title}</span>
            </a>
        );
    }

    return (
        <a href={url} target="_blank" rel="noreferrer" className="block relative">
            <img src={url} alt="Site" className="aspect-square w-full object-cover rounded-xl border border-slate-200 hover:border-[#0f62fe] transition-colors bg-slate-50" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
            <div style={{display: 'none'}} className="aspect-square border border-slate-100 rounded-2xl flex-col items-center justify-center bg-red-50 text-red-300"><ImageIcon className="w-6 h-6 mb-1" /><span className="text-[9px] font-bold text-center px-1">File Missing</span></div>
        </a>
    );
};

const CreateWPRModal = ({ isOpen, onClose, projectId, onSuccess }) => {
    const [fetchingData, setFetchingData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [weekData, setWeekData] = useState(null); 
    
    const [contextData, setContextData] = useState({ tasks: [], inventory: [], subcontractors: [] });
    
    const [formData, setFormData] = useState({ 
        weekDate: '', 
        description: '', 
        notes: '',
        nextWeekTasks: [{ id: Date.now(), task: '', description: '' }] 
    });

    useEffect(() => {
        if (isOpen && projectId) {
            const fetchContext = async () => {
                try {
                    const token = localStorage.getItem('accessToken');
                    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
                    const headers = { Authorization: `Bearer ${token}` };

                    // 🚨 FIXED: Inventory URL now matches backend router.get('/project/:projectId')
                    const [tasksRes, invRes, subsRes] = await Promise.allSettled([
                        axios.get(`${BASE_URL}/api/v1/tasks?projectId=${projectId}`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/inventory/project/${projectId}`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/subcontractors?projectId=${projectId}`, { headers })
                    ]);

                    const extract = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];
                    setContextData({ 
                        tasks: extract(tasksRes), 
                        inventory: extract(invRes),
                        subcontractors: extract(subsRes)
                    });
                } catch (err) {
                    console.error("Failed to load translation context", err);
                }
            };
            fetchContext();
        }
    }, [isOpen, projectId]);

    const fetchRealTimeAggregation = useCallback(async () => {
        setFetchingData(true);
        try {
            const res = await getWPRPreviewAPI(projectId, formData.weekDate);
            if (res.success && res.hasData) {
                setWeekData(res.data);
            } else {
                setWeekData(null);
            }
        } catch (err) { 
            console.error("Aggregation error:", err); 
        } finally { 
            setFetchingData(false); 
        }
    }, [projectId, formData.weekDate]);

    useEffect(() => {
        if (formData.weekDate && isOpen) {
            fetchRealTimeAggregation();
        }
    }, [formData.weekDate, isOpen, fetchRealTimeAggregation]);

    const formatName = (item, type) => {
        if (!item) return 'Unnamed Item';
        try {
            const list = type === 'task' ? contextData.tasks : type === 'subcontractor' ? contextData.subcontractors : contextData.inventory;
            
            const findName = (idToFind) => {
                if (!idToFind) return '';
                const strId = String(idToFind).trim().replace(/['"\[\]]/g, '');
                const found = list.find(x => String(x.id) === strId || String(x._id) === strId);
                return found ? (found.name || found.itemName || found.taskName || found.companyName || found.title) : strId;
            };

            if (typeof item === 'string') {
                if (item.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(item);
                        if (Array.isArray(parsed)) return parsed.map(findName).join(', ');
                    } catch(e) {}
                }
                return findName(item);
            }

            if (typeof item === 'object') {
                const actualId = item.taskId || item.materialId || item.equipmentId || item.subcontractorId || item.id || item._id;
                if (actualId) return findName(actualId);
                return item.name || item.taskName || 'Unnamed Item';
            }
            return String(item);
        } catch (_error) {
            return typeof item === 'string' ? item.replace(/['"\[\]]/g, '') : 'Unnamed Item'; 
        }
    };

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
    
    // 🚨 FIXED: FORCING BASE_URL TO PREVENT IP TIMEOUTS (ERR_CONNECTION_TIMED_OUT)
    const getFileUrl = useCallback((file) => {
        if (!file) return null;
        if (file instanceof File) return URL.createObjectURL(file);

        let pathStr = typeof file === 'string' ? file : (file.imageUrl || file.url || file.fileUrl || file.filePath || '');
        if (!pathStr || typeof pathStr !== 'string') return null;
        
        pathStr = pathStr.replace(/['"\[\]]/g, '');
        if (pathStr.startsWith('blob:')) return pathStr;

        // If backend sends an absolute URL with a wrong IP, we strip it and use BASE_URL
        let relativePath = pathStr;
        if (pathStr.includes('/uploads/')) {
            relativePath = pathStr.substring(pathStr.indexOf('uploads/'));
        } else {
            const filename = pathStr.split('/').pop();
            const isDocument = filename.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i);
            relativePath = `uploads/${isDocument ? 'documents' : 'dpr-photos'}/${filename}`;
        }
        
        return `${BASE_URL}/${relativePath.startsWith('/') ? relativePath.substring(1) : relativePath}`;
    }, [BASE_URL]);

    const extractAllMedia = (source) => {
        let media = [];
        if (!source) return media;
        if (Array.isArray(source)) {
            source.forEach(item => { media = media.concat(extractAllMedia(item)); });
        } else if (typeof source === 'string') {
            if (source.includes('[') || source.includes(',')) {
                const cleaned = source.replace(/[\[\]"'\\]/g, '').split(',');
                cleaned.forEach(c => { if (c.trim()) media.push(c.trim()); });
            } else {
                media.push(source.replace(/['"\\]/g, ''));
            }
        } else if (typeof source === 'object') {
            media.push(source);
        }
        return media;
    };

    const parseNestedJSON = (data) => {
        if (!data) return [];
        let parsed = data;
        if (typeof data === 'string') {
            try { parsed = JSON.parse(data); } catch (e) { parsed = [data]; }
        }
        if (!Array.isArray(parsed)) parsed = [parsed];
        
        let flat = [];
        parsed.forEach(item => {
            if (typeof item === 'string') {
                try {
                    const inner = JSON.parse(item);
                    if (Array.isArray(inner)) flat.push(...inner);
                    else flat.push(inner);
                } catch (e) { flat.push(item); }
            } else if (Array.isArray(item)) {
                flat.push(...item);
            } else {
                flat.push(item);
            }
        });
        return flat.filter(Boolean);
    };

    const wprData = weekData?.aggregatedData || weekData || {};
    
    // 🚨 FIXED: DEFINING ALL VARIABLES TO PREVENT REFERENCE ERROR
    const parsedTasks = parseNestedJSON(wprData.tasks);
    const parsedMaterials = parseNestedJSON(wprData.materials?.consumed || wprData.materials);
    const parsedEquipment = parseNestedJSON(wprData.equipment);
    const parsedSubcontractors = parseNestedJSON(wprData.subcontractors);
    
    let allExtractedMedia = [
        ...extractAllMedia(wprData.photos),
        ...extractAllMedia(wprData.documents)
    ];
    
    const dprList = wprData.dprs || wprData.dailyReports || wprData.reports || [];
    if (Array.isArray(dprList)) {
        dprList.forEach(report => {
            allExtractedMedia = allExtractedMedia.concat(extractAllMedia(report.photos));
            allExtractedMedia = allExtractedMedia.concat(extractAllMedia(report.documents));
        });
    }

    const actualPhotos = [];
    const actualDocs = [];
    const seenUrls = new Set();

    allExtractedMedia.forEach(media => {
        const url = getFileUrl(media);
        if (!url || seenUrls.has(url)) return;
        seenUrls.add(url);
        
        if (url.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i)) actualDocs.push(media);
        else actualPhotos.push(media);
    });

    const handleSave = async () => {
        if (!weekData) return alert("Please select a valid week first.");
        setIsSaving(true);
        try {
            const payload = {
                projectId,
                weekStartDate: weekData.weekInfo.startDate,
                weekEndDate: weekData.weekInfo.endDate,
                description: formData.description,
                previewData: weekData, 
                nextWeekPlanning: formData.nextWeekTasks.filter(t => t.task.trim() !== ''),
                notes: formData.notes 
            };

            await createWPRAPI(payload);
            if (onSuccess){
                onSuccess();

            }  
            onClose();
        } catch (error) {
            console.error("WPR Creation Error:", error);
            alert(error.response?.data?.message || error.message || "Failed to save the WPR.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black text-slate-800">Create WPR</h2>
                    <button onClick={onClose} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WPR Week</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={formData.weekDate} 
                                onChange={e => setFormData({...formData, weekDate: e.target.value})} 
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0f62fe] appearance-none bg-white" 
                            />
                            <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0f62fe] pointer-events-none" />
                        </div>
                    </div>

                    {fetchingData ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0f62fe]" />
                            <p className="text-[10px] font-black text-[#0f62fe] uppercase tracking-widest">Aggregating Weekly Data...</p>
                        </div>
                    ) : weekData ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Weather</label>
                                <div className="grid grid-cols-7 gap-2">
                                    {weekData.weather?.map((w, i) => (
                                        <div key={i} className="flex flex-col items-center p-2 text-center border border-slate-100 rounded-xl bg-slate-50/50">
                                            <span className="text-[9px] font-bold text-slate-400">{w.day}</span>
                                            <span className="text-lg mt-1">{w.code}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#0f62fe] min-h-[80px] resize-none" placeholder="Enter the description"></textarea>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Attendance</h3>
                                <div className="h-40 flex items-end justify-between px-6 pb-2 border-b border-dashed border-slate-200 relative">
                                    <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-between text-[9px] font-bold text-slate-400"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
                                    {weekData.attendance?.daily?.map((d, i) => {
                                        const workerHeight = Math.min(((d.workers || 0) / 40) * 100, 100);
                                        const staffHeight = Math.min(((d.staff || 0) / 40) * 100, 100);
                                        
                                        return (
                                            <div key={i} className="relative w-4 flex flex-col justify-end h-full gap-1">
                                                <div className="w-full bg-[#00B69B] rounded-full" style={{ height: `${staffHeight}%`, minHeight: '4px' }}></div>
                                                <div className="w-full bg-[#0f62fe] rounded-full" style={{ height: `${workerHeight}%`, minHeight: '4px' }}></div>
                                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400">{d.date}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-center gap-10 mt-6">
                                    <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#0f62fe] rounded-full"></div><span className="text-[10px] font-bold text-slate-500">{weekData.attendance?.summary?.avgWorkers || 0}<br/>Workers (avg)</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#00B69B] rounded-full"></div><span className="text-[10px] font-bold text-slate-500">{weekData.attendance?.summary?.avgStaff || 0}<br/>Staff (avg)</span></div>
                                </div>
                            </div>

                            <FigmaSection title="Sub-contractor Names">
                                {parsedSubcontractors.length > 0 
                                    ? parsedSubcontractors.map((sc, i) => <FigmaRow key={i} label={formatName(sc, 'subcontractor')} value={`${sc.specialization || 'Assigned'}`} isBlue />) 
                                    : <p className="text-[10px] text-slate-400 italic px-2">No active subcontractors.</p>}
                            </FigmaSection>

                            <FigmaSection title="Tasks">
                                {parsedTasks.length > 0 
                                    ? parsedTasks.map((t, i) => <FigmaRow key={i} label={formatName(t, 'task')} badge={t.status || 'IN PROGRESS'} color={(t.status || '').toUpperCase() === 'COMPLETED' ? 'emerald' : 'amber'} />) 
                                    : <p className="text-[10px] text-slate-400 italic px-2">No tasks progressed.</p>}
                            </FigmaSection>

                            <FigmaSection title="Materials">
                                {parsedMaterials.length > 0 
                                    ? parsedMaterials.map((m, i) => <FigmaRow key={i} label={formatName(m, 'inventory')} value={m.quantity || 'Used'} isBlue />) 
                                    : <p className="text-[10px] text-slate-400 italic px-2">No materials consumed.</p>}
                            </FigmaSection>

                            <FigmaSection title="Equipments">
                                {parsedEquipment.length > 0 
                                    ? parsedEquipment.map((e, i) => <FigmaRow key={i} label={formatName(e, 'inventory')} value={e.hrsUsed || e.hours || 'Used'} isBlue />) 
                                    : <p className="text-[10px] text-slate-400 italic px-2">No equipment used.</p>}
                            </FigmaSection>

                            <FigmaSection title="Budget">
                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <FigmaRow label="Labour" value={`₹ ${(weekData.budget?.labor || 0).toLocaleString()}`} isBlue />
                                    <FigmaRow label="Material" value={`₹ ${(weekData.budget?.materials || 0).toLocaleString()}`} isBlue />
                                    <FigmaRow label="Equipment" value={`₹ ${(weekData.budget?.equipment || 0).toLocaleString()}`} isBlue />
                                    <FigmaRow label="Sub-contractor" value={`₹ ${(weekData.budget?.subcontractor || 0).toLocaleString()}`} isBlue />
                                    <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-slate-800 text-[11px]"><span className="uppercase">Total Weekly Spend</span><span className="text-[#0f62fe]">₹ {(weekData.budget?.used || weekData.budget?.total || 0).toLocaleString()}</span></div>
                                </div>
                            </FigmaSection>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Photos Attached from DPRs</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {actualPhotos.length > 0 ? actualPhotos.map((photo, i) => (
                                        <SecureMediaFetcher key={i} file={photo} getFileUrl={getFileUrl} isDoc={false} />
                                    )) : <p className="text-xs font-bold text-slate-400 col-span-4">No photos aggregated.</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Docs Attached from DPRs</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {actualDocs.length > 0 ? actualDocs.map((doc, i) => (
                                        <SecureMediaFetcher key={i} file={doc} getFileUrl={getFileUrl} isDoc={true} />
                                    )) : <p className="text-xs font-bold text-slate-400 col-span-4">No documents aggregated.</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Calendar className="mx-auto text-blue-200 mb-3" size={32} />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select a week to generate data</p>
                        </div>
                    )}

                    <div className="space-y-3 pt-6 border-t border-slate-100">
                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Next Week Planning</label>
                        {formData.nextWeekTasks.map((t, idx) => (
                            <div key={t.id} className="flex gap-2">
                                <input 
                                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0f62fe] bg-white" 
                                    placeholder="Enter planned task..." 
                                    value={t.task}
                                    onChange={(e) => {
                                        const updated = [...formData.nextWeekTasks];
                                        updated[idx].task = e.target.value;
                                        setFormData({...formData, nextWeekTasks: updated});
                                    }}
                                />
                                <button type="button" onClick={() => setFormData({...formData, nextWeekTasks: formData.nextWeekTasks.filter(x => x.id !== t.id)})} className="p-3 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setFormData({...formData, nextWeekTasks: [...formData.nextWeekTasks, {id: Date.now(), task: '', description: ''}]})} className="w-full py-3 border border-dashed border-blue-200 text-[#0f62fe] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">+ Add Task</button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Notes</label>
                        <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none min-h-[80px] resize-none" placeholder="Add any notes or observations..."></textarea>
                    </div>

                </div>

                <div className="p-6 border-t border-slate-100 flex justify-center shrink-0 bg-white">
                    <button 
                        onClick={handleSave} 
                        disabled={!weekData || isSaving} 
                        className="px-16 py-3.5 bg-[#0f62fe] text-white font-black text-[13px] rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
                    >
                        {isSaving && <Loader2 className="animate-spin" size={16} />} Create WPR
                    </button>
                </div>
            </div>
        </div>
    );
};

const FigmaSection = ({ title, children }) => (
    <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</label>
        <div className="space-y-3">{children}</div>
    </div>
);

const FigmaRow = ({ label, value, isBlue, badge, color }) => (
    <div className="flex justify-between items-center text-xs px-2">
        <span className="font-bold text-slate-700">{label}</span>
        {badge ? (
            <span className={`px-3 py-1 rounded-md font-black text-[9px] uppercase tracking-widest text-white ${color === 'emerald' ? 'bg-[#00B69B]' : color === 'amber' ? 'bg-[#FF9500]' : 'bg-[#FF3B30]'}`}>{badge}</span>
        ) : (
            <span className={`font-black ${isBlue ? 'text-[#0f62fe]' : 'text-slate-800'}`}>{value}</span>
        )}
    </div>
);

export default CreateWPRModal;