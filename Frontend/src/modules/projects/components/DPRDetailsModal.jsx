import React, { useState, useEffect } from 'react';
import { X, Sun, Cloud, CloudRain, Image as ImageIcon, FileText, Trash2, Edit, Loader2 } from 'lucide-react';
import axios from 'axios';

const DPRDetailsModal = ({ isOpen, onClose, dpr, onDelete }) => {
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        team: [],
        tasks: [],
        inventory: [],
        subcontractors: []
    });

    useEffect(() => {
        if (isOpen && dpr?.projectId) {
            const fetchContextData = async () => {
                setIsFetchingData(true);
                try {
                    const token = localStorage.getItem('accessToken');
                    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
                    const headers = { Authorization: `Bearer ${token}` };

                    const [teamRes, tasksRes, invRes, subsRes] = await Promise.allSettled([
                        axios.get(`${BASE_URL}/api/v1/projects/${dpr.projectId}/team`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/tasks`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/inventory`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/subcontractors`, { headers })
                    ]);

                    const extractData = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];

                    setDropdownData({
                        team: extractData(teamRes),
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
    }, [isOpen, dpr]);

    if (!isOpen || !dpr) return null;

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

    const getTaskName = (id) => {
        const item = dropdownData.tasks.find(t => String(t.id) === String(id) || String(t._id) === String(id));
        return item ? (item.name || item.taskName) : id;
    };
    const getInventoryName = (id) => {
        const item = dropdownData.inventory.find(i => String(i.id) === String(id) || String(i._id) === String(id));
        return item ? (item.name || item.itemName) : id;
    };
    const getUserName = (id) => {
        const item = dropdownData.team.find(u => String(u.id) === String(id) || String(u.userId) === String(id));
        return item ? (item.name || item.fullName) : id;
    };
    const getSubcontractorName = (id) => {
        const item = dropdownData.subcontractors.find(s => String(s.id) === String(id) || String(s._id) === String(id));
        return item ? (item.name || item.companyName) : id;
    };

    const getFileUrl = (file) => {
        if (!file) return '';
        let path = typeof file === 'string' ? file : (file.imageUrl || file.url || file.fileUrl || file.filePath);
        if (!path) return '';

        // 🚨 FIX: Removed unnecessary escape character \/
        const filename = path.split(/[/\\]/).pop().split('?')[0];
        return `${BASE_URL}/uploads/dpr-photos/${filename}`;
    };

    const getWeatherIcon = (weather) => {
        if (!weather) return <Sun className="w-4 h-4" />;
        const w = weather.toLowerCase();
        if (w.includes('cloud')) return <Cloud className="w-4 h-4" />;
        if (w.includes('rain')) return <CloudRain className="w-4 h-4" />;
        return <Sun className="w-4 h-4" />;
    };

    const safeJSONParse = (data, fallback = []) => {
        if (!data) return fallback;
        if (Array.isArray(data)) return data;
        try { return JSON.parse(data); } catch (_error) { return fallback; } // 🚨 FIX: Added underscore
    };

    const parsedTasks = safeJSONParse(dpr.completedWork);
    const parsedMaterials = safeJSONParse(dpr.materialsUsed);
    const parsedEquipments = safeJSONParse(dpr.equipmentsUsed || dpr.equipmentUsed);
    const parsedSubcontractors = safeJSONParse(dpr.subcontractors);
    const parsedNextDayTasks = safeJSONParse(dpr.nextDayTasks || dpr.nextDayPlan);

    const attendance = dpr.attendances || {};
    const budget = dpr.budget || {};
    
    const allMedia = dpr.photos || [];
    
    const actualPhotos = allMedia.filter(media => {
        const url = (typeof media === 'string' ? media : (media.imageUrl || media.url || '')).toLowerCase();
        return !url.match(/\.(pdf|doc|docx|txt)$/i); 
    });

    const actualDocs = allMedia.filter(media => {
        const url = (typeof media === 'string' ? media : (media.imageUrl || media.url || '')).toLowerCase();
        return url.match(/\.(pdf|doc|docx|txt)$/i); 
    });

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 relative">
                
                {isFetchingData && (
                    <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
                        <Loader2 className="w-10 h-10 text-[#0066CC] animate-spin mb-4" />
                        <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Loading Report Details...</p>
                    </div>
                )}

                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} disabled={isFetchingData} className="p-2 hover:bg-slate-100 rounded-full transition-colors -ml-2 text-slate-400 hover:text-slate-600 disabled:opacity-50">
                            <X size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">DPR Details</h2>
                            <p className="text-xs font-bold text-blue-500 tracking-tight">
                                {dpr.project?.name || 'Project Name'} | {dpr.reportNo || `DPR-${dpr.projectId?.substring(0, 4)}`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button onClick={() => alert("Edit Modal Integration Pending")} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => onDelete(dpr.id)} className="flex items-center gap-1.5 px-4 py-2 border border-red-100 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-white transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-slate-800">
                                Site Visitor: <span className="font-medium text-slate-600">{getUserName(dpr.visitorId) || 'No visitors recorded'}</span>
                            </span>
                            <div className="flex items-center gap-1.5 text-blue-500 text-xs font-bold capitalize bg-blue-50 px-3 py-1.5 rounded-lg">
                                {getWeatherIcon(dpr.weather)} {dpr.weather || 'Sunny'}
                            </div>
                        </div>
                        <div className="space-y-1 mb-6">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Work Description</span>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                                {dpr.workDescription || dpr.description || 'No description provided for this date.'}
                            </p>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-8 border-t border-slate-100 pt-8">
                        
                        <DataSection title="Attendance" subTitle="Daily Count">
                            <Row label="Workers" value={`${dpr.totalWorkers || attendance.workers || dpr.workersPresent || 0}`} isBlue />
                            <Row label="Staff" value={`${dpr.staffCount || attendance.staff || dpr.staffPresent || 0}`} isBlue />
                        </DataSection>

                        <DataSection title="Tasks Completed">
                            {parsedTasks.length > 0 ? (
                                parsedTasks.map((taskId, idx) => (
                                    <Row key={idx} label={`Task ${idx + 1}`} value={getTaskName(taskId)} badge="emerald" />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic font-bold">No tasks recorded</p>
                            )}
                        </DataSection>

                        <DataSection title="Materials Consumed">
                            {parsedMaterials.length > 0 ? (
                                parsedMaterials.map((m, idx) => (
                                    <Row key={idx} label={getInventoryName(m.materialId)} value={`${m.quantity} Units`} isBlue />
                                ))
                            ) : dpr.materialConsumptions?.length > 0 ? (
                                dpr.materialConsumptions.map((m, idx) => (
                                    <Row key={idx} label={m.material?.name || 'Material'} value={`${m.quantity} ${m.unit || ''}`} isBlue />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic font-bold">No materials recorded</p>
                            )}
                        </DataSection>

                        <DataSection title="Equipments Used">
                            {parsedEquipments.length > 0 ? (
                                parsedEquipments.map((e, idx) => (
                                    <Row key={idx} label={getInventoryName(e.equipmentId)} value={`${e.hrsUsed || e.hours || 0} Hrs`} isBlue />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic font-bold">No equipment recorded</p>
                            )}
                        </DataSection>

                        <DataSection title="Sub-contractors On Site">
                            {parsedSubcontractors.length > 0 ? (
                                parsedSubcontractors.map((subId, idx) => (
                                    <Row key={idx} label={`Sub-contractor ${idx+1}`} value={getSubcontractorName(subId)} isBold />
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic font-bold">No sub-contractors recorded</p>
                            )}
                        </DataSection>

                        <DataSection title="Budget Utilized">
                            <Row label="Labour Cost" value={`₹ ${(budget.labor || dpr.laborCost || 0).toLocaleString()}`} isBold />
                            <Row label="Material Cost" value={`₹ ${(budget.materials || dpr.materialsCost || 0).toLocaleString()}`} isBold />
                            <Row label="Equipment Cost" value={`₹ ${(budget.equipment || dpr.equipmentCost || 0).toLocaleString()}`} isBold />
                            <div className="pt-3 border-t border-slate-200 flex justify-between">
                                <span className="text-sm font-black text-slate-800">Total Utilized</span>
                                <span className="text-sm font-black text-[#0066CC]">₹ ${(budget.used || dpr.budgetUsed || 0).toLocaleString()}</span>
                            </div>
                        </DataSection>

                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Site Photos</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {actualPhotos.length > 0 ? actualPhotos.map((photo, idx) => {
                                    const url = getFileUrl(photo);
                                    return (
                                        <a href={url} target="_blank" rel="noreferrer" key={idx} className="block group relative">
                                            <img 
                                                src={url} 
                                                alt={`Site Photo ${idx+1}`} 
                                                className="aspect-square w-full object-cover rounded-xl border border-slate-200 hover:border-blue-500 transition-colors bg-slate-50" 
                                                onError={(e) => { 
                                                    e.target.style.display = 'none'; 
                                                    e.target.nextSibling.style.display = 'flex'; 
                                                }}
                                            />
                                            <div style={{display: 'none'}} className="aspect-square border border-slate-100 rounded-2xl flex-col items-center justify-center bg-red-50 text-red-300">
                                                <ImageIcon className="w-6 h-6 mb-1" />
                                                <span className="text-[9px] font-bold text-center px-1">File Missing</span>
                                            </div>
                                        </a>
                                    );
                                }) : (
                                    <p className="text-xs font-bold text-slate-400 col-span-4">No photos uploaded.</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Documents</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {actualDocs.length > 0 ? actualDocs.map((doc, idx) => {
                                    const url = getFileUrl(doc);
                                    const title = doc.title || doc.name || url.split('/').pop() || `Document ${idx + 1}`;
                                    return (
                                        <a href={url} target="_blank" rel="noreferrer" key={idx} className="aspect-square border border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-[#F8FAFC] hover:bg-blue-50 hover:border-blue-300 transition-all text-blue-500 p-3 text-center shadow-sm">
                                            <FileText className="w-8 h-8 mb-2" />
                                            <span className="text-[9px] font-bold text-slate-700 truncate w-full px-1 leading-tight" title={title}>{title}</span>
                                        </a>
                                    );
                                }) : (
                                    <p className="text-xs font-bold text-slate-400 col-span-4">No documents uploaded.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border border-slate-200 rounded-xl p-5 min-h-[100px] bg-white shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Next Day Planning</span>
                                {parsedNextDayTasks.length > 0 ? (
                                    <ul className="list-disc pl-4 text-xs text-slate-700 font-medium leading-relaxed">
                                        {parsedNextDayTasks.map((taskId, idx) => <li key={idx}>{getTaskName(taskId)}</li>)}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{dpr.nextDayPlan || 'No tasks planned.'}</p>
                                )}
                            </div>

                            <div className="border border-slate-200 rounded-xl p-5 min-h-[100px] bg-white shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Notes / Issues</span>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                    {dpr.notes || dpr.remarks || dpr.challenges || dpr.issuesFound || 'No additional notes provided.'}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const DataSection = ({ title, subTitle, children }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</h3>
            {subTitle && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">{subTitle}</span>}
        </div>
        <div className="space-y-3">{children}</div>
    </div>
);

const Row = ({ label, value, badge, isBlue, isBold }) => (
    <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-600">{label}</span>
        {badge ? (
            <span className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${
                badge === 'emerald' ? 'bg-[#00A86B] text-white' : badge === 'yellow' ? 'bg-[#FBBF24] text-white' : 'bg-[#EF4444] text-white'
            }`}>{value}</span>
        ) : (
            <span className={`text-[11px] font-black ${isBlue ? 'text-[#0066CC]' : isBold ? 'text-slate-800' : 'text-slate-700'}`}>{value}</span>
        )}
    </div>
);

export default DPRDetailsModal;