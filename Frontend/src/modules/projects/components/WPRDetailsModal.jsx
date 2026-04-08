import React from 'react';
import { X, Edit, Trash2, Cloud, CloudRain, Sun, FileText, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const WPRDetailsModal = ({ isOpen, onClose, wpr }) => {
    if (!isOpen || !wpr) return null;

    // The backend saves the generated data inside 'aggregatedData' or directly on 'wpr'
    // We need to safely extract it depending on how the backend structure is nested.
    const data = wpr.aggregatedData || wpr;
    const projectInfo = data.projectInfo || {};
    
    // Fallbacks
    const progress = data.progress || { currentOverall: '0%', todayAdded: '+0%' };
    const materials = data.materials?.consumed || [];
    const tasks = data.tasks || [];
    const photos = data.photos || [];
    const documents = data.documents || [];
    const equipment = data.equipment || [];
    const subcontractors = data.subcontractors || [];
    const weather = data.weather || [];
    const attendance = data.attendance || { daily: [], summary: { avgWorkers: 0, avgStaff: 0 } };
    const nextWeekPlanning = data.nextWeekPlanning || [];

    // Map weather codes to icons
    const getWeatherIcon = (code) => {
        if (!code) return <Cloud size={18} className="text-slate-400"/>;
        const lowerCode = code.toLowerCase();
        if (lowerCode.includes('sun') || lowerCode.includes('☀️')) return <Sun size={18} className="text-amber-500"/>;
        if (lowerCode.includes('rain') || lowerCode.includes('🌧️')) return <CloudRain size={18} className="text-blue-400"/>;
        return <Cloud size={18} className="text-slate-400"/>;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200 h-[90vh]">
                
                {/* Header */}
                <div className="px-8 py-6 flex justify-between items-start border-b border-slate-100 shrink-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">WPR Details</h2>
                            <p className="text-xs font-bold text-[#0066CC]">{projectInfo.name || wpr.projectName || 'Project Name'}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{projectInfo.location || 'Location Not Specified'} | {projectInfo.projectId || 'ID-XXX'}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all">
                            <Edit size={14} /> Edit
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={14} /> Delete
                        </button>
                        <button onClick={onClose} className="ml-2 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto custom-scrollbar p-8 space-y-10">
                    
                    {/* Visitor & Weather */}
                    <div>
                        <p className="text-sm font-bold text-slate-800 mb-4">Site Visitor: <span className="font-black">{wpr.preparedBy?.name || data.generatedBy || 'N/A'}</span></p>
                        
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Weather</label>
                        <div className="flex justify-between items-center mt-3 max-w-sm">
                            {weather.length > 0 ? weather.map((w, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400">{w.day}</span>
                                    {getWeatherIcon(w.code)}
                                </div>
                            )) : (
                                <p className="text-xs font-bold text-slate-400">No weather data recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <p className="text-sm font-bold text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                            {wpr.description || 'No description provided for this week.'}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                            <span className="text-slate-400">Progress</span>
                            <div className="text-right">
                                <p className="text-[#00B69B]">Today Progress Added: {progress.todayAdded || '+0%'}</p>
                                <p className="text-[#0066CC]">Current Overall Progress: {progress.currentOverall || '0%'}</p>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div className="bg-[#0066CC] h-full rounded-full transition-all duration-1000" style={{ width: progress.currentOverall || '0%' }}></div>
                        </div>
                    </div>

                    {/* Attendance Chart Mockup (Dynamic heights based on real data) */}
                    <div className="border border-slate-100 p-6 rounded-3xl">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Attendance</label>
                        <div className="flex items-end justify-between h-40 mt-4 px-4 border-b border-dashed border-slate-200">
                            {attendance.daily?.length > 0 ? attendance.daily.map((d, i) => {
                                // Dynamic height calculation (max 40 for scale)
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

                    {/* Sub Contractors */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Sub-contractor Names</label>
                        <div className="space-y-3">
                            {subcontractors.length > 0 ? subcontractors.map((sub, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl">
                                    <span className="text-sm font-bold text-slate-700">{sub.name || `Sub-contractor ${idx + 1}`}</span>
                                    <span className="text-xs font-black text-[#0066CC]">{sub.specialization || 'General Work'}</span>
                                </div>
                            )) : (
                                <p className="text-xs font-bold text-slate-400 italic">No subcontractors assigned this week.</p>
                            )}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tasks</label>
                        <div className="space-y-3 border border-slate-100 p-4 rounded-2xl">
                            {tasks.length > 0 ? tasks.map((task, idx) => {
                                let statusBg = "bg-amber-500";
                                let statusText = task.status || "In Progress";
                                if (statusText.toUpperCase() === 'COMPLETED') statusBg = "bg-[#00B69B]";
                                else if (statusText.toUpperCase() === 'PENDING') statusBg = "bg-[#FF3B30]";

                                return (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700">{task.name} <span className="text-[#0066CC] text-xs">{task.completed}</span></span>
                                        <span className={`${statusBg} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md`}>{statusText}</span>
                                    </div>
                                );
                            }) : (
                                <p className="text-xs font-bold text-slate-400 italic">No tasks recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Materials & Equipments (Side by side based on Image 5) */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Materials</label>
                            <div className="space-y-3 border-t border-slate-100 pt-3">
                                {materials.length > 0 ? materials.map((mat, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-700">{mat.name}</span>
                                        <span className="text-xs font-black text-[#0066CC]">{mat.quantity}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs font-bold text-slate-400 italic">No materials used.</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Equipments</label>
                            <div className="space-y-3 border-t border-slate-100 pt-3">
                                {equipment.length > 0 ? equipment.map((eq, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-700">{eq.name}</span>
                                        <span className="text-xs font-black text-[#0066CC]">{eq.hrsUsed}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs font-bold text-slate-400 italic">No equipment used.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Budget (Standalone section based on Image 5) */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Budget</label>
                        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            {/* Assuming budget data might not be fully implemented yet, adding fallbacks to 0 */}
                            <div className="flex justify-between"><span className="text-xs font-bold text-slate-700">Labour</span><span className="text-xs font-black text-[#0066CC]">₹ {data.budget?.labor || '0'}</span></div>
                            <div className="flex justify-between"><span className="text-xs font-bold text-slate-700">Material</span><span className="text-xs font-black text-[#0066CC]">₹ {data.budget?.material || '0'}</span></div>
                            <div className="flex justify-between"><span className="text-xs font-bold text-slate-700">Equipment</span><span className="text-xs font-black text-[#0066CC]">₹ {data.budget?.equipment || '0'}</span></div>
                            <div className="flex justify-between"><span className="text-xs font-bold text-slate-700">Sub-contractor</span><span className="text-xs font-black text-[#0066CC]">₹ {data.budget?.subcontractor || '0'}</span></div>
                            <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-slate-800 text-[11px]"><span className="uppercase">Total</span><span className="text-[#0066CC]">₹ {data.budget?.total || '0'}</span></div>
                        </div>
                    </div>

                    {/* Uploaded Photos */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Photos</label>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {photos.length > 0 ? photos.map((photoUrl, i) => (
                                <img key={i} src={photoUrl.url || photoUrl} alt={`Site ${i}`} className="w-24 h-24 shrink-0 object-cover bg-slate-100 rounded-2xl border border-slate-200" />
                            )) : (
                                <p className="text-xs font-bold text-slate-400">No photos uploaded.</p>
                            )}
                        </div>
                    </div>

                    {/* Uploaded Documents */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Documents</label>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {documents.length > 0 ? documents.map((doc, i) => (
                                <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="w-24 h-24 shrink-0 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                    <FileText size={24} className="mb-1" />
                                    <span className="text-[9px] font-bold px-2 truncate w-full text-center">{doc.title || doc.name || 'Document'}</span>
                                </a>
                            )) : (
                                <p className="text-xs font-bold text-slate-400">No documents uploaded.</p>
                            )}
                        </div>
                    </div>

                    {/* Next Week Planning */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Next Week Planning!</label>
                        <div className="space-y-3">
                            {nextWeekPlanning.length > 0 ? nextWeekPlanning.map((plan, i) => (
                                <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                                    <p className="text-sm font-bold text-slate-800">{plan.task}</p>
                                    {plan.description && <p className="text-xs text-slate-500 mt-1">{plan.description}</p>}
                                </div>
                            )) : (
                                <p className="text-xs font-bold text-slate-400 italic">No tasks planned for next week.</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="pb-8">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Notes</label>
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                                {wpr.notes || 'No additional notes provided.'}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WPRDetailsModal;