// src/modules/projects/components/CreateDPRModal.jsx
import React, { useState } from 'react';
import { X, Upload, Check, Plus, Trash2, CloudSun, Cloud, CloudRain } from 'lucide-react';
import { dprService } from '../services/dpr.service';

const CreateDPRModal = ({ isOpen, onClose, refresh, projectId }) => {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState('Sunny');
  
  // State for complex data sections
  const [tasks, setTasks] = useState([{ id: Date.now(), taskId: '', status: 'Pending' }]);
  const [materials, setMaterials] = useState([{ id: Date.now(), materialId: '', quantity: 1 }]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    workDescription: '', // CHANGED: Matched backend Zod expectation
    completedWork: '',    // ADDED: Matched backend Zod expectation
    siteVisitor: '',
    workersCount: 0,
    staffCount: 0,
    remarks: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 1: Create the payload matching Backend Zod Schema
      const payload = { 
        projectId,
        date: formData.date,
        weather: weather.toUpperCase(), // Backend often expects uppercase
        workDescription: formData.workDescription,
        completedWork: formData.completedWork || formData.workDescription, // Ensure this isn't undefined
        siteVisitor: formData.siteVisitor,
        attendance: {
            workers: Number(formData.workersCount),
            staff: Number(formData.staffCount)
        },
        tasks: tasks.filter(t => t.taskId).map(t => ({ taskId: t.taskId, status: t.status })),
        materials: materials.filter(m => m.materialId).map(m => ({ materialId: m.materialId, quantity: m.quantity })),
        remarks: formData.remarks
      };
      
      console.log("Sending Payload:", payload);
      const result = await dprService.createDPR(payload);
      
      // Step 2: Upload Photo if report creation succeeded
      if (selectedFile && result.data?.id) {
        await dprService.uploadDPRPhoto(result.data.id, selectedFile);
      }

      refresh();
      onClose();
    } catch (error) {
      console.error("DPR Creation Error Details:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to create report. Check console for Zod errors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl h-[92vh] rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-slate-800">Create DPR</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-4">
            <InputBlock label="DPR Date" type="date" value={formData.date} onChange={(val) => setFormData({...formData, date: val})} />
            <InputBlock label="Site Visitor" type="text" placeholder="Enter visitor name" value={formData.siteVisitor} onChange={(val) => setFormData({...formData, siteVisitor: val})} />
          </div>

          <InputBlock 
            label="Work Description" 
            type="textarea" 
            placeholder="Plan for the day..." 
            value={formData.workDescription} 
            onChange={(val) => setFormData({...formData, workDescription: val})} 
          />

          <InputBlock 
            label="Completed Work" 
            type="textarea" 
            placeholder="What was actually achieved?" 
            value={formData.completedWork} 
            onChange={(val) => setFormData({...formData, completedWork: val})} 
          />

          {/* Weather Selection */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Weather</label>
            <div className="flex gap-2">
               <WeatherBtn label="Sunny" icon={CloudSun} active={weather === 'Sunny'} onClick={() => setWeather('Sunny')} />
               <WeatherBtn label="Cloudy" icon={Cloud} active={weather === 'Cloudy'} onClick={() => setWeather('Cloudy')} />
               <WeatherBtn label="Rainy" icon={CloudRain} active={weather === 'Rainy'} onClick={() => setWeather('Rainy')} />
            </div>
          </div>

          {/* Attendance Section */}
          <div className="border-t border-slate-100 pt-8">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Attendance</h3>
             <div className="grid grid-cols-2 gap-4">
                <InputBlock label="Workers" type="number" value={formData.workersCount} onChange={(val) => setFormData({...formData, workersCount: val})} />
                <InputBlock label="Staff" type="number" value={formData.staffCount} onChange={(val) => setFormData({...formData, staffCount: val})} />
             </div>
          </div>

          {/* Dynamic Task Section */}
          <div className="border-t border-slate-100 pt-8 space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks Completed</h3>
             {tasks.map((task, idx) => (
                <div key={task.id} className="flex gap-2 items-end">
                   <div className="flex-1"><InputBlock type="text" placeholder="Task details..." value={task.taskId} onChange={(val) => {
                     const newTasks = [...tasks];
                     newTasks[idx].taskId = val;
                     setTasks(newTasks);
                   }} /></div>
                   <button type="button" onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="p-2 mb-1 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
             ))}
             <button type="button" onClick={() => setTasks([...tasks, { id: Date.now(), taskId: '', status: 'Pending' }])} className="w-full py-3 border-2 border-dashed border-blue-100 text-blue-600 text-xs font-black uppercase rounded-xl hover:bg-blue-50">
               + Add Task
             </button>
          </div>

          {/* File Upload Area */}
          <div className="border-t border-slate-100 pt-8">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Upload Site Photos</label>
            <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-400 transition-colors group cursor-pointer relative">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files[0])} />
              <div className="text-center">
                <Upload className="mx-auto h-10 w-10 text-slate-300 group-hover:text-blue-500 transition-colors" />
                <p className="mt-2 text-xs font-black text-blue-600 uppercase tracking-widest">{selectedFile ? selectedFile.name : "Click to upload photos"}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">JPG, PNG up to 10MB each</p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 shrink-0">
           <button 
             type="submit" 
             onClick={handleSubmit}
             disabled={loading}
             className="w-full py-4 bg-[#0066CC] text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
           >
              {loading ? "Processing..." : "Create DPR"}
           </button>
        </div>
      </div>
    </div>
  );
};

const InputBlock = ({ label, type, placeholder, value, onChange }) => (
  <div className="space-y-1">
    {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>}
    {type === 'textarea' ? (
      <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500" placeholder={placeholder} rows="3" value={value} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input type={type} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    )}
  </div>
);

const WeatherBtn = ({ label, icon: Icon, active, onClick }) => (
  <button type="button" onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-black transition-all ${active ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
    <Icon className="w-4 h-4" /> {label}
  </button>
);

export default CreateDPRModal;