import React, { useState } from 'react';
import { X, Sun, Cloud, CloudRain, Trash2, Image as ImageIcon, FileText, Plus, Minus } from 'lucide-react';

const CreateDPRModal = ({ isOpen, onClose, projectId, onSubmit }) => {
    const [formData, setFormData] = useState({
        date: '',
        siteVisitor: '',
        description: '',
        weather: 'Sunny',
        workersPresent: 16,
        staffPresent: 2,
        tasks: [{ id: 1, name: '' }],
        materials: [{ id: 1, name: '', quantity: 1 }],
        equipment: [{ id: 1, name: '', hours: 1 }],
        subcontractors: [{ id: 1, name: '' }],
        nextDayPlan: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleAddRow = (field, template) => setFormData({ ...formData, [field]: [...formData[field], { ...template, id: Date.now() }] });
    const handleRemoveRow = (field, id) => setFormData({ ...formData, [field]: formData[field].filter(item => item.id !== id) });

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black text-slate-800">Create DPR</h2>
                    <button onClick={onClose} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DPR Date</label>
                            <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Visitor</label>
                            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#0066CC] bg-white">
                                <option>Select visitor</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#0066CC] min-h-[80px] resize-none" placeholder="Enter the description"></textarea>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Weather</label>
                        <div className="flex gap-3">
                            {['Sunny', 'Cloudy', 'Rainy'].map(w => (
                                <button key={w} type="button" onClick={() => setFormData({...formData, weather: w})} className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold border transition-all ${formData.weather === w ? 'bg-blue-50 border-blue-200 text-[#0066CC]' : 'bg-white border-slate-200 text-slate-500'}`}>
                                    {w === 'Sunny' ? <Sun size={14} /> : w === 'Cloudy' ? <Cloud size={14} /> : <CloudRain size={14} />} {w}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Attendance <span className="text-[#0066CC] ml-2">18/20 Present</span></h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-slate-200 rounded-xl px-4 py-2 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Workers</span>
                                <input type="number" value={formData.workersPresent} onChange={e => setFormData({...formData, workersPresent: e.target.value})} className="w-12 text-right font-black text-slate-800 outline-none" />
                            </div>
                            <div className="border border-slate-200 rounded-xl px-4 py-2 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Staff</span>
                                <input type="number" value={formData.staffPresent} onChange={e => setFormData({...formData, staffPresent: e.target.value})} className="w-12 text-right font-black text-slate-800 outline-none" />
                            </div>
                        </div>
                    </div>

                    <DynamicSection title="Tasks Completed" items={formData.tasks} onAdd={() => handleAddRow('tasks', {name: ''})} onRemove={(id) => handleRemoveRow('tasks', id)}>
                        {(item) => <select className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none bg-white"><option>Select task</option></select>}
                    </DynamicSection>

                    <DynamicSection title="Add Materials" items={formData.materials} onAdd={() => handleAddRow('materials', {name: '', quantity: 1})} onRemove={(id) => handleRemoveRow('materials', id)}>
                        {(item) => (
                            <div className="flex flex-1 gap-2">
                                <select className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none bg-white"><option>Select material</option></select>
                                <div className="flex items-center border border-slate-200 rounded-xl px-2">
                                    <button type="button" className="p-1 text-slate-400 hover:text-[#0066CC]"><Minus size={14} /></button>
                                    <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                                    <button type="button" className="p-1 text-slate-400 hover:text-[#0066CC]"><Plus size={14} /></button>
                                </div>
                            </div>
                        )}
                    </DynamicSection>

                    <DynamicSection title="Add Equipments" items={formData.equipment} onAdd={() => handleAddRow('equipment', {name: '', hours: 1})} onRemove={(id) => handleRemoveRow('equipment', id)}>
                        {(item) => (
                            <div className="flex flex-1 gap-2">
                                <select className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none bg-white"><option>Select equipment</option></select>
                                <div className="flex items-center border border-slate-200 rounded-xl px-2">
                                    <button type="button" className="p-1 text-slate-400 hover:text-[#0066CC]"><Minus size={14} /></button>
                                    <span className="w-8 text-center text-sm font-black">{item.hours}</span>
                                    <button type="button" className="p-1 text-slate-400 hover:text-[#0066CC]"><Plus size={14} /></button>
                                </div>
                            </div>
                        )}
                    </DynamicSection>

                    <DynamicSection title="Tasks Sub-contractor" items={formData.subcontractors} onAdd={() => handleAddRow('subcontractors', {name: ''})} onRemove={(id) => handleRemoveRow('subcontractors', id)}>
                        {(item) => <select className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none bg-white"><option>Select sub-contractor</option></select>}
                    </DynamicSection>

                    <UploadSection title="Upload Site Photos" icon={ImageIcon} format="JPG, PNG up to 10MB each" />
                    <UploadSection title="Upload Documents" icon={FileText} format="PDF, DOC up to 10MB each" />

                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Next Day Planning</label>
                        <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none bg-white"><option>Select task for tomorrow</option></select>
                        <button type="button" className="w-full py-3 border border-dashed border-blue-200 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">+ Add Task</button>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Notes</label>
                        <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium outline-none min-h-[80px] resize-none" placeholder="Add any notes or observations..."></textarea>
                    </div>

                </div>

                <div className="p-6 border-t border-slate-100 flex justify-center shrink-0 bg-white">
                    <button className="px-16 py-3.5 bg-[#0066CC] text-white font-black text-[13px] rounded-xl hover:bg-blue-800 transition-all shadow-md">
                        Create DPR
                    </button>
                </div>
            </div>
        </div>
    );
};

const DynamicSection = ({ title, items, onAdd, onRemove, children }) => (
    <div className="space-y-3">
        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</label>
        {items.map((item) => (
            <div key={item.id} className="flex gap-2">
                {children(item)}
                <button type="button" onClick={() => onRemove(item.id)} className="p-3 text-red-300 hover:text-red-500 bg-red-50 rounded-xl"><Trash2 size={16} /></button>
            </div>
        ))}
        <button type="button" onClick={onAdd} className="w-full py-3 border border-dashed border-blue-200 text-[#0066CC] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">+ Add {title.split(' ')[1] || 'Item'}</button>
    </div>
);

const UploadSection = ({ title, icon: Icon, format }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{title}</label>
        <label className="w-full border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all">
            <Icon className="text-[#0066CC] mb-2" size={24} />
            <span className="text-[12px] font-black text-[#0066CC]">Click to upload</span>
            <span className="text-[10px] font-bold text-slate-400 mt-1">{format}</span>
            <input type="file" className="hidden" />
        </label>
    </div>
);

export default CreateDPRModal;