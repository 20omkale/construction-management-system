import React from 'react';
import { X, Sun, Cloud, CloudRain, Image as ImageIcon, FileText, Trash2, Edit } from 'lucide-react';

const DPRDetailsModal = ({ isOpen, onClose, dpr, onDelete }) => {
  if (!isOpen || !dpr) return null;

  // 🚨 BASE URL FOR FIXING BROKEN IMAGE LINKS
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

  // Helper to safely format the URL whether it's an object or string
  const getFileUrl = (file) => {
      if (!file) return '';
      const path = typeof file === 'string' ? file : (file.url || file.imageUrl || file.fileUrl || file.filePath);
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getWeatherIcon = (weather) => {
    if (!weather) return <Sun className="w-4 h-4" />;
    const w = weather.toLowerCase();
    if (w.includes('cloud')) return <Cloud className="w-4 h-4" />;
    if (w.includes('rain')) return <CloudRain className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  const attendance = dpr.attendances || {};
  const budget = dpr.budget || {};
  const materials = dpr.materialConsumptions || [];
  
  // Safely extract photos and documents
  const photos = dpr.photos || dpr.images || dpr.attachments?.filter(a => a.type?.includes('photo')) || [];
  const documents = dpr.documents || dpr.attachments?.filter(a => !a.type?.includes('photo')) || []; 

  let equipmentList = [];
  try {
      if (Array.isArray(dpr.equipmentUsage)) equipmentList = dpr.equipmentUsage;
      else if (typeof dpr.equipmentUsed === 'string' && dpr.equipmentUsed.startsWith('[')) {
          equipmentList = JSON.parse(dpr.equipmentUsed);
      }
  } catch (e) {}

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header with EDIT & DELETE Buttons */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors -ml-2 text-slate-400 hover:text-slate-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
             </button>
             <div>
                <h2 className="text-xl font-black text-slate-800">DPR Details</h2>
                <p className="text-xs font-bold text-blue-500 tracking-tight">
                  {dpr.project?.name || 'Project Name'} | ID-{dpr.projectId?.substring(0, 4) || '2341'}
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
              <button 
                onClick={() => alert("Edit Functionality requires the Update Modal")}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                  <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button 
                onClick={() => onDelete(dpr.id)} 
                className="flex items-center gap-1.5 px-4 py-2 border border-red-100 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
              >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          <section>
            <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-black text-slate-800">
                 Site Visitor: <span className="font-medium text-slate-600">{dpr.siteVisitors?.[0]?.name || 'No visitors recorded'}</span>
               </span>
               <div className="flex items-center gap-1.5 text-blue-500 text-xs font-bold capitalize bg-blue-50 px-3 py-1.5 rounded-lg">
                 {getWeatherIcon(dpr.weather)} {dpr.weather || 'Sunny'}
               </div>
            </div>
            <div className="space-y-1 mb-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {dpr.workDescription || dpr.completedWork || 'No description provided for this date.'}
                </p>
            </div>

            <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                <div className="flex items-center gap-6">
                    <div className="flex-1 h-8 bg-blue-50 rounded-lg flex overflow-hidden border border-blue-100">
                        <div className="w-[1.5%] h-full bg-[#0066CC] rounded-r-sm"></div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-800 space-y-1">
                        <p>Today Progress Added <span className="text-[#0066CC] ml-1">+1.5%</span></p>
                        <p>Current Overall Progress <span className="text-[#0066CC] ml-1">29.5%</span></p>
                    </div>
                </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 border-t border-slate-100 pt-8">
            
            <DataSection title="Tasks" subTitle="Subtasks">
                {dpr.tasks && dpr.tasks.length > 0 ? (
                    dpr.tasks.map((t, idx) => (
                        <Row key={idx} label={t.taskId || t.name || 'Task'} value={t.status || 'Completed'} badge="emerald" />
                    ))
                ) : (
                    <p className="text-xs text-slate-400 italic font-bold">No tasks recorded</p>
                )}
            </DataSection>

            <DataSection title="Attendance" subTitle={`${attendance.total || dpr.workersPresent || 0}/30 Present`}>
                <Row label="Workers" value={`${attendance.subcontractor || dpr.workersPresent || 0}`} isBlue />
                <Row label="Staff" value={`${attendance.siteStaff || dpr.staffPresent || 0}`} isBlue />
                {dpr.subcontractorDetails?.name && <Row label={`Sub-contractor: ${dpr.subcontractorDetails.name}`} value={`${dpr.subcontractorDetails.workers || 0} workers`} isBlue />}
            </DataSection>

            <DataSection title="Materials">
                {materials.length > 0 ? (
                    materials.map((m, idx) => (
                        <Row key={idx} label={m.material?.name || 'Material Name'} value={`${m.quantity} ${m.unit || m.material?.unit || 'Used'}`} isBlue />
                    ))
                ) : (
                    <p className="text-xs text-slate-400 italic font-bold">No materials recorded</p>
                )}
            </DataSection>

            <DataSection title="Equipments">
                {equipmentList.length > 0 ? (
                    equipmentList.map((e, idx) => (
                        <Row key={idx} label={e.name || 'Equipment Name'} value={`${e.hours || e.hrs || 0} Hrs Used`} isBlue />
                    ))
                ) : (
                    <p className="text-xs text-slate-400 italic font-bold">No equipment recorded</p>
                )}
            </DataSection>

            <DataSection title="Budget">
                <Row label="Labour" value={`₹ ${(budget.labor || dpr.laborCost || 0).toLocaleString()}`} isBold />
                <Row label="Material" value={`₹ ${(budget.materials || dpr.materialsCost || 0).toLocaleString()}`} isBold />
                <Row label="Equipment" value={`₹ ${(budget.equipment || dpr.equipmentCost || 0).toLocaleString()}`} isBold />
                <div className="pt-3 border-t border-slate-200 flex justify-between">
                   <span className="text-sm font-black text-slate-800">Total</span>
                   <span className="text-sm font-black text-[#0066CC]">₹ ${(budget.used || dpr.budgetUsed || 0).toLocaleString()}</span>
                </div>
            </DataSection>

            {/* 🚨 FIXED: Photos Rendering */}
            <div>
               <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Photos</h3>
               <div className="grid grid-cols-4 gap-3">
                  {photos.length > 0 ? photos.map((photo, idx) => {
                      const url = getFileUrl(photo);
                      return (
                          <a href={url} target="_blank" rel="noreferrer" key={idx}>
                              <img 
                                src={url} 
                                alt="Site" 
                                className="aspect-square w-full object-cover rounded-xl border border-slate-200 hover:border-blue-500 transition-colors bg-slate-50" 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/F8FAFC/A4BBE2?text=Error'; }}
                              />
                          </a>
                      );
                  }) : [1,2,3,4].map(box => (
                      <div key={box} className="aspect-square border border-slate-100 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-300">
                          <ImageIcon className="w-8 h-8" />
                      </div>
                  ))}
               </div>
            </div>

            {/* 🚨 FIXED: Documents Rendering */}
            <div>
               <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Documents</h3>
               <div className="grid grid-cols-4 gap-3">
                  {documents.length > 0 ? documents.map((doc, idx) => {
                      const url = getFileUrl(doc);
                      const title = typeof doc === 'string' ? `Document ${idx + 1}` : (doc.title || doc.name || `Document ${idx + 1}`);
                      return (
                          <a href={url} target="_blank" rel="noreferrer" key={idx} className="aspect-square border border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-[#F8FAFC] hover:bg-blue-50 transition-colors text-blue-500 p-2 text-center">
                              <FileText className="w-8 h-8 mb-2" />
                              <span className="text-[9px] font-bold text-slate-600 truncate w-full px-1">{title}</span>
                          </a>
                      );
                  }) : [1,2,3,4].map(box => (
                      <div key={box} className="aspect-square border border-slate-100 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-300">
                          <FileText className="w-8 h-8" />
                      </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl p-5 min-h-[100px] bg-white shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Issues</span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{dpr.challenges || 'No issues reported for this date.'}</p>
                </div>
                
                <div className="border border-slate-200 rounded-xl p-5 min-h-[100px] bg-white shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tasks (Next Day Plan)</span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{dpr.nextDayPlan || 'No tasks reported.'}</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-5 min-h-[100px] bg-white shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Notes</span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{dpr.remarks || 'No additional notes provided.'}</p>
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