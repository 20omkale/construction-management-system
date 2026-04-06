import React from 'react';
import { X, Sun, CheckCircle2, FileText, Image as ImageIcon, MapPin } from 'lucide-react';

const DPRDetailsModal = ({ isOpen, onClose, dpr }) => {
  if (!isOpen || !dpr) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
             </button>
             <div>
                <h2 className="text-xl font-black text-slate-800">DPR Details</h2>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Project Name | ID-2341</p>
             </div>
          </div>
          <div className="flex items-center gap-2 text-orange-500 font-bold text-sm bg-orange-50 px-3 py-1 rounded-lg">
             <Sun className="w-4 h-4" /> Sunny
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Summary Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Site Visitor: <span className="text-slate-800">Name</span></span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {dpr.description || "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
            </p>
          </section>

          {/* Progress Bar Section */}
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-emerald-600">Today Progress Added: +1.5%</p>
                   <p className="text-[10px] font-bold text-blue-600">Current Overall Progress: 29.5%</p>
                </div>
             </div>
             <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '29.5%' }}></div>
             </div>
          </section>

          {/* Data Tables Wrapper */}
          <div className="grid grid-cols-1 gap-8">
            {/* Tasks Section */}
            <DataSection title="Tasks" subTitle="Subtasks">
                <Row label="Task Name 4/4" value="Completed" badge="emerald" />
                <Row label="Task Name 4/4" value="In Progress" badge="orange" />
                <Row label="Task Name 4/4" value="Pending" badge="slate" />
            </DataSection>

            {/* Attendance Section */}
            <DataSection title="Attendance" subTitle="22/30 Present">
                <Row label="Workers" value="16/20" />
                <Row label="Staff" value="6/10" />
                <Row label="Sub-contractor" value="4 workers" isBlue />
            </DataSection>

            {/* Budget Section */}
            <DataSection title="Budget">
                <Row label="Labour" value="₹ 1,20,000" isBold />
                <Row label="Material" value="₹ 1,20,000" isBold />
                <Row label="Equipment" value="₹ 1,20,000" isBold />
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                   <span className="text-sm font-black text-slate-800">Total</span>
                   <span className="text-sm font-black text-slate-800">₹ 4,80,000</span>
                </div>
            </DataSection>

            {/* Photos & Docs */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase mb-4">Photos</h3>
                  <div className="grid grid-cols-2 gap-2">
                     {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300"><ImageIcon className="w-5 h-5" /></div>)}
                  </div>
               </div>
               <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase mb-4">Documents</h3>
                  <div className="grid grid-cols-2 gap-2">
                     {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300"><FileText className="w-5 h-5" /></div>)}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components for the Modal
const DataSection = ({ title, subTitle, children }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
       <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</h3>
       {subTitle && <span className="text-[10px] font-bold text-blue-600 uppercase">{subTitle}</span>}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const Row = ({ label, value, badge, isBlue, isBold }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-bold text-slate-500">{label}</span>
    {badge ? (
      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
        badge === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
        badge === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'
      }`}>{value}</span>
    ) : (
      <span className={`text-sm font-black ${isBlue ? 'text-blue-600' : isBold ? 'text-slate-800' : 'text-slate-700'}`}>{value}</span>
    )}
  </div>
);

export default DPRDetailsModal;