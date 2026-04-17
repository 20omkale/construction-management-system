import React, { useState, useEffect } from 'react';
import { X, Sun, Cloud, CloudRain, FileText, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { dprService } from '../../projects/services/dpr.service';

const InspectionDPRModal = ({ isOpen, onClose, dpr, onSuccess }) => {
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullDprData, setFullDprData] = useState(null);

    const [dropdownData, setDropdownData] = useState({
        team: [], tasks: [], inventory: [], subcontractors: []
    });

    useEffect(() => {
        if (isOpen && dpr?.id) {
            const fetchFullDetailsAndContext = async () => {
                setIsFetchingData(true);
                try {
                    const dprDetails = await dprService.getDPRById(dpr.id);
                    const currentDpr = dprDetails.data || dprDetails;
                    setFullDprData(currentDpr);

                    const token = localStorage.getItem('accessToken');
                    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
                    const headers = { Authorization: `Bearer ${token}` };

                    const [teamRes, tasksRes, invRes, subsRes] = await Promise.allSettled([
                        axios.get(`${BASE_URL}/api/v1/projects/${currentDpr.projectId}/team`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/tasks`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/inventory`, { headers }),
                        axios.get(`${BASE_URL}/api/v1/subcontractors`, { headers })
                    ]);

                    const extractData = (res) => res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || []) : [];
                    setDropdownData({
                        team: extractData(teamRes), tasks: extractData(tasksRes),
                        inventory: extractData(invRes), subcontractors: extractData(subsRes)
                    });
                } catch (error) {
                    console.error("Failed to load modal data:", error);
                } finally {
                    setIsFetchingData(false);
                }
            };
            fetchFullDetailsAndContext();
        }
    }, [isOpen, dpr]);

    const handleAction = async (statusAction) => {
        if (!fullDprData?.id) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('accessToken');
            const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';
            
            // "REVIEW" is the accepted schema value for rejecting
            const finalStatus = statusAction === 'REJECTED' ? 'REVIEW' : 'COMPLETED';

            const response = await axios.patch(
                `${BASE_URL}/api/v1/dpr/${fullDprData.id}/approve`,
                { 
                    status: finalStatus, 
                    comments: finalStatus === 'COMPLETED' ? 'Approved' : 'Rejected' 
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (response.data.success) onSuccess(); 
            else alert(response.data.message || "Failed to update status");
        } catch (error) {
            console.error("Action error:", error);
            if (error.response?.data?.error?.name === 'ZodError' || error.response?.data?.message?.includes('Invalid option')) {
                 alert("Backend Schema Error: Invalid status option sent.");
            } else if (error.response?.status === 401) {
                alert("Session expired. Please log in again.");
            } else {
                alert("Something went wrong processing the approval.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const displayDpr = fullDprData || dpr;
    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

    // Helpers strictly from your projects > DPR logic
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

    const getFileUrl = (file) => {
        if (!file) return '';
        let path = typeof file === 'string' ? file : (file.imageUrl || file.url || file.fileUrl || file.filePath);
        if (!path) return '';
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
        try { return JSON.parse(data); } catch (_e) { return fallback; }
    };

    // Real-time Parsed Data
    const parsedTasks = safeJSONParse(displayDpr.completedWork);
    const parsedMaterials = safeJSONParse(displayDpr.materialsUsed);
    const parsedEquipments = safeJSONParse(displayDpr.equipmentsUsed || displayDpr.equipmentUsed);
    
    const attendance = displayDpr.attendances || {};
    const budget = displayDpr.budget || {};
    const allMedia = displayDpr.photos || [];
    
    const actualPhotos = allMedia.filter(media => {
        const url = (typeof media === 'string' ? media : (media.imageUrl || '')).toLowerCase();
        return !url.match(/\.(pdf|doc|docx|txt)$/i); 
    });
    
    const actualDocs = allMedia.filter(media => {
        const url = (typeof media === 'string' ? media : (media.imageUrl || '')).toLowerCase();
        return url.match(/\.(pdf|doc|docx|txt)$/i); 
    });

    const projectProgress = displayDpr.project?.progress || 0;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl h-[90vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
                
                {(isFetchingData || isSubmitting) && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#0f62fe] animate-spin mb-3" />
                        <p className="text-sm font-semibold text-slate-700">{isSubmitting ? 'Processing...' : 'Loading Details...'}</p>
                    </div>
                )}

                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start shrink-0 bg-white">
                    <div>
                        <button onClick={onClose} className="flex items-center gap-2 text-[18px] font-bold text-slate-900 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={20} className="text-slate-900" /> DPR Details
                        </button>
                        <div className="mt-1 pl-7 text-[13px]">
                            <span className="text-[#0f62fe] font-medium">{displayDpr.project?.name}</span>
                            <span className="text-slate-400 ml-1">{displayDpr.project?.location || 'Location'} | {displayDpr.project?.projectId}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                    
                    {/* Site Visitor & Weather */}
                    <div className="flex justify-between items-center pb-2">
                        <span className="text-[14px] font-semibold text-slate-900">
                            Site Visitor: <span className="font-normal text-slate-600">{getUserName(displayDpr.visitorId) || 'None'}</span>
                        </span>
                        <div className="flex items-center gap-1.5 text-[#0f62fe] text-sm font-medium bg-blue-50/50 px-3 py-1 rounded-md">
                            {getWeatherIcon(displayDpr.weather)} {displayDpr.weather || 'N/A'}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="text-sm text-slate-600">Description</h3>
                        <p className="text-[14px] text-slate-900 leading-relaxed">
                            {displayDpr.workDescription || displayDpr.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Progress Bar (Real-time mapped) */}
                    <div className="space-y-3">
                        <h3 className="text-sm text-slate-600">Progress</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-[22px] bg-blue-100 rounded-md overflow-hidden flex">
                                <div className="h-full bg-[#0f62fe]" style={{ width: `${projectProgress}%` }}></div>
                            </div>
                            <div className="flex flex-col items-end text-[12px]">
                                <span className="text-slate-800 mt-0.5">Current Overall Progress <span className="text-[#0f62fe] font-bold">- {projectProgress}%</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Tasks (Real-time mapped) */}
                    <SectionBox title="Tasks" count={parsedTasks.length > 0 ? `${parsedTasks.length} Completed` : ''} border>
                        {parsedTasks.length > 0 ? (
                            parsedTasks.map((taskId, idx) => (
                                <Row key={idx} label={getTaskName(taskId)} value="Completed" badge="emerald" />
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 font-medium">No tasks recorded in this DPR.</p>
                        )}
                    </SectionBox>

                    {/* Attendance (Real-time mapped) */}
                    <SectionBox title="Attendance" count={`${displayDpr.totalWorkers || attendance.workers || displayDpr.workersPresent || 0} Present`} border>
                        <Row label="Workers" value={displayDpr.totalWorkers || attendance.workers || displayDpr.workersPresent || 0} isBlue />
                        <Row label="Staff" value={displayDpr.staffCount || attendance.staff || displayDpr.staffPresent || 0} isBlue />
                        <Row label="Sub-contractor" value={`${attendance.subcontractor || 0} workers`} isBlue />
                    </SectionBox>

                    {/* Materials (Real-time mapped) */}
                    <SectionBox title="Materials" border>
                         <div className="flex justify-between text-[13px] text-slate-500 font-medium mb-3 border-b border-slate-100 pb-2">
                             <span>Name</span><span>Quantity Used</span>
                         </div>
                        {parsedMaterials.length > 0 ? (
                            parsedMaterials.map((m, idx) => <Row key={idx} label={getInventoryName(m.materialId)} value={`${m.quantity} Used`} isBlue />)
                        ) : displayDpr.materialConsumptions?.length > 0 ? (
                            displayDpr.materialConsumptions.map((m, idx) => (
                                <Row key={idx} label={m.material?.name || 'Material'} value={`${m.quantity} ${m.unit || ''}`} isBlue />
                            ))
                        ) : (
                             <p className="text-xs text-slate-400 font-medium">No materials explicitly recorded.</p>
                        )}
                    </SectionBox>

                    {/* Equipments (Real-time mapped) */}
                    <SectionBox title="Equipments" border>
                         <div className="flex justify-between text-[13px] text-slate-500 font-medium mb-3 border-b border-slate-100 pb-2">
                             <span>Name</span>
                             <div className="flex gap-8"><span>Hrs Used</span><span>Fuel</span></div>
                         </div>
                        {parsedEquipments.length > 0 ? (
                            parsedEquipments.map((e, idx) => <Row key={idx} label={getInventoryName(e.equipmentId)} value={`${e.hrsUsed || e.hours || 0} Hrs`} isBlue />)
                        ) : (
                            <p className="text-xs text-slate-400 font-medium">No equipment usage recorded.</p>
                        )}
                    </SectionBox>

                    {/* Budget (Real-time mapped) */}
                    <SectionBox title="Budget" border>
                        <Row label="Labour" value={`₹ ${(budget.labor || displayDpr.laborCost || 0).toLocaleString('en-IN')}`} isBold />
                        <Row label="Material" value={`₹ ${(budget.materials || displayDpr.materialsCost || 0).toLocaleString('en-IN')}`} isBold />
                        <Row label="Equipment" value={`₹ ${(budget.equipment || displayDpr.equipmentCost || 0).toLocaleString('en-IN')}`} isBold />
                        <div className="pt-2 mt-2 border-t border-slate-100">
                             <Row label="Total" value={`₹ ${(budget.used || displayDpr.budgetUsed || 0).toLocaleString('en-IN')}`} isBlack />
                        </div>
                    </SectionBox>

                    {/* Photos (Real-time mapped with functioning links) */}
                    <SectionBox title="Photos" border>
                        <div className="flex gap-4 overflow-x-auto">
                            {actualPhotos.length > 0 ? actualPhotos.map((photo, idx) => {
                                const url = getFileUrl(photo);
                                return (
                                    <a href={url} target="_blank" rel="noreferrer" key={idx} className="shrink-0 block group relative">
                                        <img src={url} alt={`Site Photo ${idx+1}`} className="w-24 h-24 object-cover rounded-xl border border-slate-200 hover:border-blue-500 transition-colors" />
                                    </a>
                                );
                            }) : (
                                <p className="text-xs text-slate-400 font-medium">No photos uploaded.</p>
                            )}
                        </div>
                    </SectionBox>

                    {/* Documents (Real-time mapped with functioning links) */}
                    <SectionBox title="Documents" border>
                        <div className="flex gap-4 overflow-x-auto">
                            {actualDocs.length > 0 ? actualDocs.map((doc, idx) => {
                                const url = getFileUrl(doc);
                                const title = doc.title || doc.name || url.split('/').pop() || `Document ${idx + 1}`;
                                return (
                                    <a href={url} target="_blank" rel="noreferrer" key={idx} className="w-24 h-24 rounded-xl border border-slate-200 bg-[#F8FAFC] flex flex-col items-center justify-center shrink-0 hover:bg-blue-50 hover:border-blue-300 transition-all text-blue-500">
                                        <FileText className="w-8 h-8 mb-2" />
                                        <span className="text-[9px] font-bold text-slate-700 truncate w-full px-1 text-center" title={title}>{title}</span>
                                    </a>
                                );
                            }) : (
                                <p className="text-xs text-slate-400 font-medium">No documents uploaded.</p>
                            )}
                        </div>
                    </SectionBox>

                    {/* Issues, Tasks, Notes (Real-time mapped) */}
                    {displayDpr.issuesFound && (
                        <SectionBox title="Issues" border>
                            <p className="text-[13px] text-slate-800">{displayDpr.issuesFound}</p>
                        </SectionBox>
                    )}
                    
                    {displayDpr.nextDayPlan && (
                        <SectionBox title="Notes / Next Day Plan" border>
                            <p className="text-[13px] text-slate-800 whitespace-pre-wrap">{displayDpr.nextDayPlan}</p>
                        </SectionBox>
                    )}
                </div>

                {/* FOOTER: Strict Naming & Colors */}
                {displayDpr.status !== 'COMPLETED' && (
                    <div className="px-6 py-5 border-t border-slate-100 bg-white flex justify-center gap-4 shrink-0">
                        <button 
                            onClick={() => handleAction('REJECTED')}
                            disabled={isSubmitting || isFetchingData}
                            className="px-8 py-2.5 text-red-500 font-bold hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 text-[14px]"
                        >
                            Reject
                        </button>
                        <button 
                            onClick={() => handleAction('COMPLETED')}
                            disabled={isSubmitting || isFetchingData}
                            className="px-8 py-2.5 bg-[#0f62fe] text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 text-[14px]"
                        >
                            Approve
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// UI Components
const SectionBox = ({ title, count, border, children }) => (
    <div className={`p-5 ${border ? 'border border-slate-200 rounded-xl' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[14px] text-slate-800">{title}</h3>
            {count && <span className="text-[11px] text-[#0f62fe] font-medium">{count}</span>}
        </div>
        <div>{children}</div>
    </div>
);

const Row = ({ label, subLabel, value, badge, isBlue, isBold, isBlack }) => (
    <div className="flex justify-between items-center mb-3 last:mb-0">
        <span className="text-[13px] text-slate-800">
            {label} {subLabel && <span className="text-[#0f62fe] text-[11px] ml-2">{subLabel}</span>}
        </span>
        {badge ? (
            <span className={`px-3 py-1 rounded text-[11px] font-semibold ${
                badge === 'emerald' ? 'bg-[#00A86B] text-white' : 
                badge === 'yellow' ? 'bg-[#FBBF24] text-white' : 
                'bg-[#EF4444] text-white'
            }`}>{value}</span>
        ) : (
            <span className={`text-[13px] ${isBlue ? 'text-[#0f62fe]' : isBold ? 'text-slate-800 font-medium' : isBlack ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                {value}
            </span>
        )}
    </div>
);

export default InspectionDPRModal;