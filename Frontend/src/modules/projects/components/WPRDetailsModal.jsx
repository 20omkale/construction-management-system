import React from 'react';
import { X, Calendar, Users, Hammer, Package, BarChart3, FileText, TrendingUp, Sun, Cloud, CloudRain } from 'lucide-react';

const WPRDetailsModal = ({ isOpen, onClose, wpr }) => {
    if (!isOpen || !wpr) return null;

    const data = wpr.aggregatedData || wpr;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col border border-gray-100 overflow-hidden">
                
                {/* Header Section */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0066CC]">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Weekly Progress Report</h2>
                            <p className="text-[11px] font-bold text-[#0066CC] uppercase tracking-[0.15em] mt-0.5">Automated Summary</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-[#FCFDFF]">
                    
                    {/* Date & Status Row */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <Calendar className="text-[#0066CC]" size={20} />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Report Period</p>
                                <p className="text-[15px] font-black text-slate-800">{data.weekInfo?.display || 'Current Week'}</p>
                            </div>
                        </div>
                        <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest ${wpr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {wpr.status || 'Pending Review'}
                        </span>
                    </div>

                    {/* Attendance Chart (Figma visual matching) */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Users size={14} className="text-blue-500" /> Attendance Trends
                        </h3>
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="h-40 flex items-end justify-between px-2 pb-2 border-b border-dashed border-slate-100 relative">
                                {[65, 80, 45, 95, 70, 85, 60].map((h, i) => (
                                    <div key={i} className="w-6 bg-[#0066CC] rounded-t-lg transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <div className="flex justify-center gap-10 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#0066CC] rounded-full"></div>
                                    <span className="text-[11px] font-bold text-slate-500">Avg Workers: {data.attendance?.summary?.avgWorkers || 28}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#00B69B] rounded-full"></div>
                                    <span className="text-[11px] font-bold text-slate-500">Avg Staff: {data.attendance?.summary?.avgStaff || 7}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Materials */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package size={14} className="text-emerald-500" /> Material Consumption
                            </h3>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                {data.materials?.consumed?.map((m, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                        <span className="text-xs font-bold text-slate-600">{m.name}</span>
                                        <span className="text-xs font-black text-[#0066CC]">{m.quantity}</span>
                                    </div>
                                )) || <p className="text-xs text-slate-400 italic">No materials consumed this week.</p>}
                            </div>
                        </div>

                        {/* Equipment */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Hammer size={14} className="text-amber-500" /> Equipment Usage
                            </h3>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                                {data.equipment?.map((e, i) => (
                                    <div key={i} className="flex justify-between items-center mb-4 last:mb-0">
                                        <span className="text-xs font-bold text-slate-600">{e.name}</span>
                                        <span className="text-xs font-black text-[#0066CC]">{e.hrsUsed}</span>
                                    </div>
                                )) || <p className="text-xs text-slate-400 italic">No equipment usage recorded.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Summary Notes */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText size={14} className="text-[#0066CC]" /> Executive Summary
                        </h3>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-sm text-slate-700 leading-relaxed font-medium italic whitespace-pre-wrap">
                                "{wpr.description || 'System-calculated weekly summary based on approved daily progress reports.'}"
                            </p>
                        </div>
                    </div>

                </div>

                {/* Bottom Footer */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Generated by {wpr.preparedBy?.name || 'System'}</p>
                    <button onClick={onClose} className="px-10 py-3 bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg">
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WPRDetailsModal;