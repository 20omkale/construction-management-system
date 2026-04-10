import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, Trash2, Cloud, CloudRain, Sun, FileText, Image as ImageIcon, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

// 🚨 PERMANENT FIX: Bypasses Backend Helmet CORP blocks
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
                const response = await axios.get(targetUrl, { responseType: 'blob' });
                if (isMounted) setUrl(URL.createObjectURL(response.data));
            } catch (e) {
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
            <img src={url} alt="Site" className="aspect-square w-full object-cover rounded-xl border border-slate-200 hover:border-blue-500 transition-colors bg-slate-50" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
            <div style={{display: 'none'}} className="aspect-square border border-slate-100 rounded-2xl flex-col items-center justify-center bg-red-50 text-red-300"><ImageIcon className="w-6 h-6 mb-1" /><span className="text-[9px] font-bold text-center px-1">File Missing</span></div>
        </a>
    );
};

const WPRDetailsModal = ({ isOpen, onClose, wpr }) => {
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        tasks: [],
        inventory: [],
        subcontractors: []
    });

    useEffect(() => {
        if (isOpen && wpr?.projectId) {
            const fetchContextData = async () => {
                setIsFetchingData(true);
                try {
                    const token = localStorage.getItem('accessToken');
                    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
                    const headers = { Authorization: `Bearer ${token}` };

                    const [tasksRes, invRes, subsRes] = await Promise.allSettled([
                        axios.get(`${BASE_URL}/api/v1/tasks?projectId=${wpr.projectId}`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/inventory?projectId=${wpr.projectId}`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/subcontractors?projectId=${wpr.projectId}`, { headers })
                    ]);

                    const extractData = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];

                    setDropdownData({
                        tasks: extractData(tasksRes),
                        inventory: extractData(invRes),
                        subcontractors: extractData(subsRes)
                    });
                } catch (error) {
                    console.error("Failed to load context data:", error);
                } finally {
                    setIsFetchingData(false);
                }
            };
            fetchContextData();
        }
    }, [isOpen, wpr]);

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

    // 🚨 FIX: INTELLIGENT DYNAMIC ROUTING FOR DOCUMENTS VS PHOTOS
    const getFileUrl = useCallback((file) => {
        if (!file) return null;
        let pathStr = typeof file === 'string' ? file : (file.imageUrl || file.url || file.fileUrl || file.filePath || file.name || file.fileName || file.path || '');
        if (!pathStr || typeof pathStr !== 'string') return null;
        
        pathStr = pathStr.replace(/['"\[\]]/g, '');
        if (pathStr.startsWith('blob:') || pathStr.startsWith('http')) return pathStr;

        let normalizedPath = pathStr.replace(/\\/g, '/');
        if (normalizedPath.includes('uploads/')) {
            const exactPath = normalizedPath.substring(normalizedPath.indexOf('uploads/'));
            return `${BASE_URL}/${exactPath}`;
        }
        
        const filename = normalizedPath.split('/').pop().split('?')[0];
        if (!filename || filename.length < 4) return null;

        const isDocument = filename.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i);
        const targetFolder = isDocument ? 'documents' : 'dpr-photos';
        
        return `${BASE_URL}/uploads/${targetFolder}/${filename}`;
    }, [BASE_URL]);

    if (!isOpen || !wpr) return null;

    const data = wpr.aggregatedData || wpr;
    const projectInfo = data.projectInfo || {};
    const progress = data.progress || { currentOverall: '0%', todayAdded: '+0%' };

    const parseNestedJSON = (inputData) => {
        if (!inputData) return [];
        let parsed = inputData;
        if (typeof inputData === 'string') {
            try { parsed = JSON.parse(inputData); } catch (e) { parsed = [inputData]; }
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

    const formatName = (item, type) => {
        if (!item) return 'Unnamed';
        try {
            const list = type === 'task' ? dropdownData.tasks : type === 'inventory' ? dropdownData.inventory : dropdownData.subcontractors;
            
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
                return item.name || item.taskName || 'Unnamed';
            }
            return String(item);
        } catch (_error) {
            return typeof item === 'string' ? item.replace(/['"\[\]]/g, '') : 'Unnamed';
        }
    };

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

    const materials = parseNestedJSON(data.materials?.consumed || data.materials);
    const tasks = parseNestedJSON(data.tasks);
    const equipment = parseNestedJSON(data.equipment);
    const subcontractors = parseNestedJSON(data.subcontractors);
    const nextWeekPlanning = parseNestedJSON(data.nextWeekPlanning);
    const weather = Array.isArray(data.weather) ? data.weather : [];
    const attendance = data.attendance || { daily: [], summary: { avgWorkers: 0, avgStaff: 0 } };

    let allExtractedMedia = [
        ...extractAllMedia(data.photos),
        ...extractAllMedia(data.documents)
    ];
    
    const dprList = data.dprs || data.dailyReports || data.reports || [];
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

    const getWeatherIcon = (code) => {
        if (!code) return <Cloud className="text-slate-400"/>;
        const lowerCode = code.toLowerCase();
        if (lowerCode.includes('sun') || lowerCode.includes('☀️')) return <Sun size={18} className="text-amber-500"/>;
        if (lowerCode.includes('rain') || lowerCode.includes('🌧️')) return <CloudRain size={18} className="text-blue-400"/>;
        return <Cloud size={18} className="text-slate-400"/>;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200 h-[90vh] relative">
                
                {isFetchingData && (
                    <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
                        <Loader2 className="w-10 h-10 text-[#0066CC] animate-spin mb-4" />
                        <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Loading Report Details...</p>
                    </div>
                )}

                <div className="px-8 py-6 flex justify-between items-start border-b border-slate-100 shrink-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} disabled={isFetchingData} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"><ArrowLeft size={18} /></button>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">WPR Details</h2>
                            <p className="text-xs font-bold text-[#0066CC]">{projectInfo.name || wpr.projectName || 'Project Name'}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{projectInfo.location || 'Location Not Specified'} | {projectInfo.projectId || 'ID-XXX'}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => alert("Edit Functionality requires the Update Modal")} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all"><Edit size={14} /> Edit</button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /> Delete</button>
                        <button onClick={onClose} className="ml-2 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                    </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8 space-y-10">
                    <div>
                        <p className="text-sm font-bold text-slate-800 mb-4">Report Generated By: <span className="font-black">{wpr.preparedBy?.name || data.generatedBy || 'N/A'}</span></p>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Weather</label>
                        <div className="flex justify-between items-center mt-3 max-w-sm">
                            {weather.length > 0 ? weather.map((w, i) => (
                                <div key={i} className="flex flex-col items-center gap-2"><span className="text-[10px] font-black text-slate-400">{w.day}</span>{getWeatherIcon(w.code)}</div>
                            )) : <p className="text-xs font-bold text-slate-400">No weather data recorded.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <p className="text-sm font-bold text-slate-700 mt-2 leading-relaxed whitespace-pre-line">{wpr.description || 'No description provided for this week.'}</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                            <span className="text-slate-400">Progress</span>
                            <div className="text-right"><p className="text-[#00B69B]">Today Progress Added: {progress.todayAdded || '+0%'}</p><p className="text-[#0066CC]">Current Overall Progress: {progress.currentOverall || '0%'}</p></div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden"><div className="bg-[#0066CC] h-full rounded-full transition-all duration-1000" style={{ width: progress.currentOverall || '0%' }}></div></div>
                    </div>

                    <div className="border border-slate-100 p-6 rounded-3xl">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Attendance</label>
                        <div className="flex items-end justify-between h-40 mt-4 px-4 border-b border-dashed border-slate-200">
                            {attendance.daily?.length > 0 ? attendance.daily.map((d, i) => {
                                const workerHeight = Math.min(((d.workers || 0) / 40) * 100, 100);
                                const staffHeight = Math.min(((d.staff || 0) / 40) * 100, 100);
                                return (
                                    <div key={i} className="flex flex-col items-center gap-2 h-full justify-end pb-2">
                                        <div className="w-3 bg-[#00B69B] rounded-full" style={{ height: `${staffHeight}%`, minHeight: '4px' }}></div>
                                        <div className="w-4 bg-[#0066CC] rounded-full" style={{ height: `${workerHeight}%`, minHeight: '4px' }}></div>
                                        <span className="text-[10px] font-black text-slate-400 mt-2">{d.date}</span>
                                    </div>
                                );
                            }) : <p className="text-xs font-bold text-slate-400 w-full text-center">No attendance data.</p>}
                        </div>
                        <div className="flex justify-center gap-8 mt-6 border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#0066CC] rounded-full"></div><span className="text-[10px] font-black text-slate-500">{attendance.summary?.avgWorkers || 0} Workers (avg)</span></div>
                            <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#00B69B] rounded-full"></div><span className="text-[10px] font-black text-slate-500">{attendance.summary?.avgStaff || 0} Staff (avg)</span></div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Sub-contractor Names</label>
                        <div className="space-y-3">
                            {parsedSubcontractors.length > 0 ? parsedSubcontractors.map((sub, idx) => {
                                const name = formatName(sub, 'subcontractor');
                                return (
                                    <div key={idx} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl"><span className="text-sm font-bold text-slate-700">{name}</span><span className="text-xs font-black text-[#0066CC]">{sub.specialization || 'General Work'}</span></div>
                                )
                            }) : <p className="text-xs font-bold text-slate-400 italic">No subcontractors assigned this week.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tasks</label>
                        <div className="space-y-3 border border-slate-100 p-4 rounded-2xl">
                            {parsedTasks.length > 0 ? parsedTasks.map((task, idx) => {
                                let statusBg = "bg-amber-500";
                                let statusText = task.status || "In Progress";
                                if (statusText.toUpperCase() === 'COMPLETED') statusBg = "bg-[#00B69B]";
                                else if (statusText.toUpperCase() === 'PENDING') statusBg = "bg-[#FF3B30]";
                                const name = formatName(task, 'task');
                                return (
                                    <div key={idx} className="flex justify-between items-center"><span className="text-sm font-bold text-slate-700">{name} <span className="text-[#0066CC] text-xs">{task.completed || ''}</span></span><span className={`${statusBg} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md`}>{statusText}</span></div>
                                );
                            }) : <p className="text-xs font-bold text-slate-400 italic">No tasks recorded.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Materials</label>
                            <div className="space-y-3 border-t border-slate-100 pt-3">
                                {parsedMaterials.length > 0 ? parsedMaterials.map((mat, idx) => {
                                    const name = formatName(mat, 'inventory');
                                    return (
                                        <div key={idx} className="flex justify-between"><span className="text-xs font-bold text-slate-700">{name}</span><span className="text-xs font-black text-[#0066CC]">{mat.quantity || ''}</span></div>
                                    )
                                }) : <p className="text-xs font-bold text-slate-400 italic">No materials used.</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Equipments</label>
                            <div className="space-y-3 border-t border-slate-100 pt-3">
                                {parsedEquipment.length > 0 ? parsedEquipment.map((eq, idx) => {
                                    const name = formatName(eq, 'inventory');
                                    return (
                                        <div key={idx} className="flex justify-between"><span className="text-xs font-bold text-slate-700">{name}</span><span className="text-xs font-black text-[#0066CC]">{eq.hrsUsed || eq.hours || ''}</span></div>
                                    )
                                }) : <p className="text-xs font-bold text-slate-400 italic">No equipment used.</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Budget</label>
                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            <div className="flex justify-between"><span className="text-xs font-bold text-slate-700">Labour</span><span className="text-xs font-black text-[#0066CC]">₹ {data.budget?.labor || '0'}</span></div>
                            <div className="flex justify-between"><span className="text-xs font-bold text-slate-700">Material</span><span className="text-xs font-black text-[#0066CC]">₹ {data.budget?.material || '0'}</span></div>
                            <div className="flex justify-between"><span className="text-xs font-bold text-slate-700">Equipment</span><span className="text-xs font-black text-[#0066CC]">₹ {data.budget?.equipment || '0'}</span></div>
                            <div className="flex justify-between"><span className="text-xs font-bold text-slate-700">Sub-contractor</span><span className="text-xs font-black text-[#0066CC]">₹ {data.budget?.subcontractor || '0'}</span></div>
                            <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-slate-800 text-[11px]"><span className="uppercase">Total</span><span className="text-[#0066CC]">₹ {data.budget?.total || '0'}</span></div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Photos</label>
                        <div className="grid grid-cols-4 gap-3 pb-2">
                            {actualPhotos.length > 0 ? actualPhotos.map((url, i) => (
                                <SecureMediaFetcher key={i} file={url} getFileUrl={getFileUrl} isDoc={false} />
                            )) : <p className="text-xs font-bold text-slate-400 col-span-4">No photos uploaded.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Documents</label>
                        <div className="grid grid-cols-4 gap-3 pb-2">
                            {actualDocs.length > 0 ? actualDocs.map((url, i) => (
                                <SecureMediaFetcher key={i} file={url} getFileUrl={getFileUrl} isDoc={true} />
                            )) : <p className="text-xs font-bold text-slate-400 col-span-4">No documents uploaded.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Next Week Planning!</label>
                        <div className="space-y-3">
                            {parsedNextWeekPlanning.length > 0 ? parsedNextWeekPlanning.map((plan, i) => (
                                <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm"><p className="text-sm font-bold text-slate-800">{formatName(plan, 'task')}</p>{plan.description && <p className="text-xs text-slate-500 mt-1">{plan.description}</p>}</div>
                            )) : <p className="text-xs font-bold text-slate-400 italic">No tasks planned for next week.</p>}
                        </div>
                    </div>

                    <div className="pb-8">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Notes</label>
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">{wpr.notes || 'No additional notes provided.'}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WPRDetailsModal;