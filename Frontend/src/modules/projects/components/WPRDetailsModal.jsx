import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, Trash2, Cloud, CloudRain, Sun, FileText, Image as ImageIcon, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

// Bypasses Backend Helmet CORP blocks for local media serving
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
            <img src={url} alt="Site" className="aspect-square w-full object-cover rounded-xl border border-slate-200 hover:border-[#0f62fe] transition-colors bg-slate-50" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
            <div style={{display: 'none'}} className="aspect-square border border-slate-100 rounded-2xl flex-col items-center justify-center bg-red-50 text-red-300"><ImageIcon className="w-6 h-6 mb-1" /><span className="text-[9px] font-bold text-center px-1">File Missing</span></div>
        </a>
    );
};

const WPRDetailsModal = ({ isOpen, onClose, wpr }) => {
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [dropdownData, setDropdownData] = useState({ tasks: [], inventory: [], subcontractors: [] });

    // Constants
    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

    // 1. Fetch Context Data
    useEffect(() => {
        if (isOpen && wpr?.projectId) {
            const fetchContextData = async () => {
                setIsFetchingData(true);
                try {
                    const token = localStorage.getItem('accessToken');
                    const headers = { Authorization: `Bearer ${token}` };
                    const [tasksRes, invRes, subsRes] = await Promise.allSettled([
                        axios.get(`${BASE_URL}/api/v1/tasks?projectId=${wpr.projectId}`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/inventory/project/${wpr.projectId}`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/subcontractors?projectId=${wpr.projectId}`, { headers })
                    ]);
                    const extract = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];
                    setDropdownData({ tasks: extract(tasksRes), inventory: extract(invRes), subcontractors: extract(subsRes) });
                } catch (error) {
                    console.error("Context fetch error:", error);
                } finally {
                    setIsFetchingData(false);
                }
            };
            fetchContextData();
        }
    }, [isOpen, wpr, BASE_URL]);

    // 2. Helper Functions
    const getFileUrl = useCallback((file) => {
        if (!file) return null;
        let pathStr = typeof file === 'string' ? file : (file.imageUrl || file.url || file.fileUrl || file.filePath || '');
        if (!pathStr || typeof pathStr !== 'string') return null;
        pathStr = pathStr.replace(/['"\[\]]/g, '');
        if (pathStr.startsWith('blob:') || pathStr.startsWith('http')) return pathStr;
        let relativePath = pathStr.includes('uploads/') ? pathStr.substring(pathStr.indexOf('uploads/')) : pathStr;
        return `${BASE_URL}/${relativePath.startsWith('/') ? relativePath.substring(1) : relativePath}`;
    }, [BASE_URL]);

    const parseNestedJSON = (input) => {
        if (!input) return [];
        try {
            const parsed = typeof input === 'string' ? JSON.parse(input) : input;
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch { return [input]; }
    };

    const formatName = (item, type) => {
        if (!item) return 'Unnamed';
        const list = type === 'task' ? dropdownData.tasks : type === 'inventory' ? dropdownData.inventory : dropdownData.subcontractors;
        const strId = String(typeof item === 'object' ? (item.id || item._id || item.taskId || item.materialId) : item).trim().replace(/['"\[\]]/g, '');
        const found = list.find(x => String(x.id) === strId || String(x._id) === strId);
        return found ? (found.name || found.itemName || found.taskName || found.title) : strId;
    };

    const extractMedia = (source) => {
        if (!source) return [];
        if (Array.isArray(source)) return source.flatMap(item => extractMedia(item));
        if (typeof source === 'string') {
            return source.includes('[') ? source.replace(/[\[\]"'\\]/g, '').split(',').map(s => s.trim()).filter(Boolean) : [source.replace(/['"\\]/g, '')];
        }
        return [source];
    };

    if (!isOpen || !wpr) return null;

    // 3. Data Processing
    const wprData = wpr.aggregatedData || wpr;
    const projectInfo = wprData.projectInfo || {};
    const progress = wprData.progress || { currentOverall: '0%', todayAdded: '+0%' };

    // 🚨 DEFINITIONS: Resolves ReferenceErrors
    const materials = parseNestedJSON(wprData.materials?.consumed || wprData.materials);
    const tasks = parseNestedJSON(wprData.tasks);
    const equipment = parseNestedJSON(wprData.equipment);
    const parsedSubcontractors = parseNestedJSON(wprData.subcontractors);
    const parsedNextWeekPlanning = parseNestedJSON(wprData.nextWeekPlanning);
    const weather = Array.isArray(wprData.weather) ? wprData.weather : [];
    const attendance = wprData.attendance || { daily: [], summary: { avgWorkers: 0, avgStaff: 0 } };

    // Media Logic
    const allMedia = [...extractMedia(wprData.photos), ...extractMedia(wprData.documents)];
    const dprList = wprData.dprs || wprData.dailyReports || [];
    dprList.forEach(r => { allMedia.push(...extractMedia(r.photos), ...extractMedia(r.documents)); });

    const seen = new Set();
    const actualPhotos = [];
    const actualDocs = [];

    allMedia.forEach(m => {
        const url = getFileUrl(m);
        if (!url || seen.has(url)) return;
        seen.add(url);
        if (url.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/i)) actualDocs.push(m);
        else actualPhotos.push(m);
    });

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200 h-[90vh] relative">
                
                {isFetchingData && (
                    <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
                        <Loader2 className="w-10 h-10 text-[#0066CC] animate-spin mb-4" />
                        <p className="text-sm font-black text-slate-700 uppercase tracking-widest text-center px-8">Syncing Project Context...</p>
                    </div>
                )}

                <div className="px-8 py-6 flex justify-between items-start border-b border-slate-100 shrink-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200"><ArrowLeft size={18} /></button>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">WPR Details</h2>
                            <p className="text-xs font-bold text-[#0f62fe]">{projectInfo.name || wpr.projectName || 'Project'}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{projectInfo.location || 'Site Location'} | {projectInfo.projectId || 'WPR-ID'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                    </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8 space-y-10 bg-white">
                    <div className="flex justify-between items-end">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Prepared By</label>
                            <p className="text-sm font-black text-slate-800 mt-1">{wpr.preparedBy?.name || wprData.generatedBy || 'System Admin'}</p>
                        </div>
                        <div className="flex gap-4">
                            {weather.map((w, i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{w.day}</span>
                                    {w.code.includes('☀️') || w.code.includes('sun') ? <Sun size={16} className="text-amber-500"/> : w.code.includes('🌧️') || w.code.includes('rain') ? <CloudRain size={16} className="text-blue-400"/> : <Cloud size={16} className="text-slate-400"/>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executive Summary</label>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">{wpr.description || 'No detailed description provided for this period.'}</p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Project Completion</span>
                            <span className="text-[#0f62fe]">{progress.currentOverall} Overall</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-[#0f62fe] h-full rounded-full transition-all duration-700" style={{ width: progress.currentOverall }}></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-slate-100 p-5 rounded-3xl bg-white shadow-sm">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Labour Summary</label>
                            <div className="flex items-end justify-between h-32 px-2">
                                {attendance.daily?.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                                        <div className="w-2.5 bg-[#00B69B] rounded-full" style={{ height: `${Math.min((d.staff / 40) * 100, 100)}%` }}></div>
                                        <div className="w-3 bg-[#0f62fe] rounded-full" style={{ height: `${Math.min((d.workers / 40) * 100, 100)}%` }}></div>
                                        <span className="text-[8px] font-bold text-slate-400">{d.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border border-slate-100 p-5 rounded-3xl bg-white shadow-sm flex flex-col justify-center gap-4">
                             <div><p className="text-lg font-black text-slate-800">{attendance.summary?.avgWorkers || 0}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Workers / Day</p></div>
                             <div><p className="text-lg font-black text-slate-800">{attendance.summary?.avgStaff || 0}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Staff / Day</p></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Progress</label>
                        <div className="grid grid-cols-1 gap-2">
                            {tasks.map((t, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-700">{formatName(t, 'task')}</span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md text-white ${t.status?.toUpperCase() === 'COMPLETED' ? 'bg-[#00B69B]' : 'bg-amber-500'}`}>{t.status || 'In Progress'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Resource Usage</label>
                            <div className="space-y-2.5">
                                {materials.slice(0, 5).map((m, i) => (
                                    <div key={i} className="flex justify-between text-[11px] font-bold"><span className="text-slate-600">{formatName(m, 'inventory')}</span><span className="text-[#0f62fe]">{m.quantity}</span></div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Next Week Planning</label>
                            <div className="space-y-2">
                                {parsedNextWeekPlanning.slice(0, 3).map((p, i) => (
                                    <div key={i} className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50"><p className="text-[11px] font-black text-slate-800">{p.task || 'Ongoing Activity'}</p></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Documentation</label>
                        <div className="grid grid-cols-4 gap-3">
                            {actualPhotos.map((p, i) => <SecureMediaFetcher key={i} file={p} getFileUrl={getFileUrl} isDoc={false} />)}
                            {actualDocs.map((d, i) => <SecureMediaFetcher key={i} file={d} getFileUrl={getFileUrl} isDoc={true} />)}
                        </div>
                    </div>

                    <div className="pb-10">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Remarks</label>
                        <div className="mt-2 bg-slate-50 p-5 rounded-2xl border border-slate-100"><p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{wpr.notes || 'No administrative notes appended to this weekly report.'}"</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WPRDetailsModal;