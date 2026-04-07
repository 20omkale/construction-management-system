import React, { useState, useEffect } from 'react';
import { X, Calendar, Cloud, CloudRain, Sun, Trash2, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
// 🚨 CORRECTED IMPORTS
import { getWPRPreviewAPI, createWPRAPI } from '../services/wpr.service';

const CreateWPRModal = ({ isOpen, onClose, projectId, onSuccess }) => {
    const [fetchingData, setFetchingData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [weekData, setWeekData] = useState(null); // Holds the real-time preview data
    
    const [formData, setFormData] = useState({ 
        weekDate: '', 
        description: '', 
        notes: '',
        nextWeekTasks: [{ id: Date.now(), task: '', description: '' }] 
    });

    // TRIGGER: Fetch preview when user selects a date
    useEffect(() => {
        if (formData.weekDate && isOpen) {
            fetchRealTimeAggregation();
        }
    }, [formData.weekDate, isOpen]);

    const fetchRealTimeAggregation = async () => {
        setFetchingData(true);
        try {
            const res = await getWPRPreviewAPI(projectId, formData.weekDate);
            if (res.success && res.hasData) {
                setWeekData(res.data);
            } else {
                setWeekData(null);
                alert("No DPRs found for this week. Cannot aggregate data.");
            }
        } catch (err) { 
            console.error("Aggregation error:", err); 
        } finally { 
            setFetchingData(false); 
        }
    };

    // TRIGGER: Finalize and Save
    const handleSave = async () => {
        if (!weekData) return alert("Please select a valid week first.");
        setIsSaving(true);
        try {
            // Payload matches your backend's "createWPR" controller exactly
            const payload = {
                projectId,
                weekStartDate: weekData.weekInfo.startDate,
                weekEndDate: weekData.weekInfo.endDate,
                description: formData.description,
                notes: formData.notes,
                previewData: weekData, // Send the aggregated data to be saved
                nextWeekPlanning: formData.nextWeekTasks.filter(t => t.task.trim() !== '')
            };

            await createWPRAPI(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            alert(error.message || "Failed to save the WPR. Please try again.");
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
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC] appearance-none bg-white" 
                            />
                            <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0066CC] pointer-events-none" />
                        </div>
                    </div>

                    {fetchingData ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" />
                            <p className="text-[10px] font-black text-[#0066CC] uppercase tracking-widest">Aggregating Weekly Data...</p>
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
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#0066CC] min-h-[80px] resize-none" placeholder="Enter the description"></textarea>
                            </div>

                            {/* Exact Figma Bar Chart */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Attendance</h3>
                                <div className="h-40 flex items-end justify-between px-6 pb-2 border-b border-dashed border-slate-200 relative">
                                    <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-between text-[9px] font-bold text-slate-400"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
                                    {weekData.attendance?.daily?.map((d, i) => {
                                        // Calculate heights based on 40 max scale for visual representation
                                        const workerHeight = Math.min(((d.workers || 0) / 40) * 100, 100);
                                        const staffHeight = Math.min(((d.staff || 0) / 40) * 100, 100);
                                        
                                        return (
                                            <div key={i} className="relative w-4 flex flex-col justify-end h-full gap-1">
                                                <div className="w-full bg-[#00B69B] rounded-full" style={{ height: `${staffHeight}%` }}></div>
                                                <div className="w-full bg-[#0066CC] rounded-full" style={{ height: `${workerHeight}%` }}></div>
                                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400">{d.date}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-center gap-10 mt-6">
                                    <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#0066CC] rounded-full"></div><span className="text-[10px] font-bold text-slate-500">{weekData.attendance?.summary?.avgWorkers || 0}<br/>Workers (avg)</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-2 bg-[#00B69B] rounded-full"></div><span className="text-[10px] font-bold text-slate-500">{weekData.attendance?.summary?.avgStaff || 0}<br/>Staff (avg)</span></div>
                                </div>
                            </div>

                            <FigmaSection title="Sub-contractor Names">
                                {weekData.subcontractors?.length > 0 
                                    ? weekData.subcontractors.map((sc, i) => <FigmaRow key={i} label={sc.name} value={`${sc.specialization}`} isBlue />) 
                                    : <p className="text-[10px] text-slate-400 italic px-2">No active subcontractors.</p>}
                            </FigmaSection>

                            <FigmaSection title="Tasks">
                                {weekData.tasks?.length > 0 
                                    ? weekData.tasks.map((t, i) => <FigmaRow key={i} label={t.name} badge={t.status} color={t.status === 'Completed' ? 'emerald' : 'amber'} />) 
                                    : <p className="text-[10px] text-slate-400 italic px-2">No tasks progressed.</p>}
                            </FigmaSection>

                            <FigmaSection title="Materials">
                                {weekData.materials?.consumed?.length > 0 
                                    ? weekData.materials.consumed.map((m, i) => <FigmaRow key={i} label={m.name} value={m.quantity} isBlue />) 
                                    : <p className="text-[10px] text-slate-400 italic px-2">No materials consumed.</p>}
                            </FigmaSection>

                            <FigmaSection title="Equipments">
                                {weekData.equipment?.length > 0 
                                    ? weekData.equipment.map((e, i) => <FigmaRow key={i} label={e.name} value={e.hrsUsed} isBlue />) 
                                    : <p className="text-[10px] text-slate-400 italic px-2">No equipment used.</p>}
                            </FigmaSection>

                            <FigmaSection title="Budget">
                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <FigmaRow label="Labour" value="₹ 1,20,000" isBlue />
                                    <FigmaRow label="Material" value="₹ 1,20,000" isBlue />
                                    <FigmaRow label="Equipment" value="₹ 1,20,000" isBlue />
                                    <FigmaRow label="Sub-contractor" value="₹ 1,20,000" isBlue />
                                    <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-slate-800 text-[11px]"><span className="uppercase">Total Weekly Spend</span><span className="text-[#0066CC]">₹ 4,80,000</span></div>
                                </div>
                            </FigmaSection>

                            {/* Static placeholders from Figma for Photos/Docs since they are auto-attached from DPRs */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Photos Attached from DPRs</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[1,2,3,4].map(i => <div key={i} className="aspect-square border border-slate-200 rounded-xl flex items-center justify-center bg-[#F8FAFC] text-blue-300"><ImageIcon size={20} /></div>)}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Docs Attached from DPRs</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {[1,2,3,4].map(i => <div key={i} className="aspect-square border border-slate-200 rounded-xl flex items-center justify-center bg-[#F8FAFC] text-blue-300"><FileText size={20} /></div>)}
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
                                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC] bg-white" 
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
                        <button type="button" onClick={() => setFormData({...formData, nextWeekTasks: [...formData.nextWeekTasks, {id: Date.now(), task: '', description: ''}]})} className="w-full py-3 border border-dashed border-blue-200 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">+ Add Task</button>
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
                        className="px-16 py-3.5 bg-[#0066CC] text-white font-black text-[13px] rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
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
            <span className={`font-black ${isBlue ? 'text-[#0066CC]' : 'text-slate-800'}`}>{value}</span>
        )}
    </div>
);

export default CreateWPRModal;