// src/modules/projects/components/CreateWPRModal.jsx
import React, { useState } from 'react';
import { X, CloudSun, ImageIcon, FileText } from 'lucide-react';
import { dprService } from '../services/dpr.service';

const CreateWPRModal = ({ isOpen, onClose, refresh, projectId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weekDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dprService.createWPR({ ...formData, projectId });
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create WPR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl h-[95vh] rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Create WPR</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WPR Week</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none" 
              value={formData.weekDate}
              onChange={(e) => setFormData({...formData, weekDate: e.target.value})}
            />
          </div>

          {/* Weekly Weather (Image 31) */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Weather Summary</label>
            <div className="grid grid-cols-7 gap-2">
                {[1,2,3,4,5,6,7].map(day => (
                    <div key={day} className="text-center space-y-2 py-3 bg-slate-50/50 rounded-xl border border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400">0{day}</span>
                        <CloudSun className="mx-auto w-5 h-5 text-slate-300" />
                    </div>
                ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            <textarea 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500" 
              placeholder="Enter the description" 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Attendance (Image 31) */}
          <div className="border-t border-slate-100 pt-8">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Weekly Attendance (Avg)</h3>
             <div className="h-40 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6">
                <div className="flex items-end gap-3 h-full mb-4">
                    <div className="w-4 h-24 bg-blue-500 rounded-t-sm" />
                    <div className="w-4 h-16 bg-emerald-500 rounded-t-sm" />
                    <div className="w-4 h-20 bg-blue-500 rounded-t-sm" />
                    <div className="w-4 h-12 bg-emerald-500 rounded-t-sm" />
                    <div className="w-4 h-28 bg-blue-500 rounded-t-sm" />
                    <div className="w-4 h-14 bg-emerald-500 rounded-t-sm" />
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /><span className="text-[10px] font-black uppercase text-slate-500">28 Workers (avg)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /><span className="text-[10px] font-black uppercase text-slate-500">7 Staff (avg)</span></div>
                </div>
             </div>
          </div>

          {/* Budget Overview (Image 31) */}
          <div className="border-t border-slate-100 pt-8">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Budget Overview</h3>
             <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <BudgetLine label="Labour" value="₹ 1,20,000" />
                <BudgetLine label="Material" value="₹ 1,20,000" />
                <BudgetLine label="Equipment" value="₹ 1,20,000" />
                <BudgetLine label="Sub-contractor" value="₹ 1,20,000" />
                <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-slate-900">
                    <span className="text-sm">Total</span>
                    <span className="text-sm">₹ 4,80,000</span>
                </div>
             </div>
          </div>

          {/* Uploads */}
          <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-8">
             <Section title="Photos" icon={ImageIcon} />
             <Section title="Documents" icon={FileText} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
            <textarea 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none" 
              placeholder="Add any notes or observations..." 
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 shrink-0 bg-white rounded-b-3xl">
           <button 
             type="submit" 
             onClick={handleSubmit}
             disabled={loading}
             className="w-full py-4 bg-[#0066CC] text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
           >
              {loading ? "Processing..." : "Create WPR"}
           </button>
        </div>
      </div>
    </div>
  );
};

const BudgetLine = ({ label, value }) => (
    <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-500 uppercase tracking-tight">{label}</span>
        <span className="text-blue-600">₹ {value.toLocaleString()}</span>
    </div>
);

const Section = ({ title, icon: Icon }) => (
  <div>
     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
     <div className="w-full h-28 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-blue-200 transition-colors cursor-pointer">
        <Icon className="w-6 h-6 mb-1" />
        <span className="text-[9px] font-black uppercase tracking-widest">Click to upload</span>
     </div>
  </div>
);

export default CreateWPRModal;