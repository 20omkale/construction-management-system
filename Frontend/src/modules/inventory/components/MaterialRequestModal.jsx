import React, { useState } from 'react';
import { X } from 'lucide-react';

const MaterialRequestModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ material: '', quantity: '', priority: 'Normal' });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-[24px] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Request Material</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" placeholder="Material Name" onChange={e => setFormData({...formData, material: e.target.value})} />
                    <input type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" placeholder="Quantity Needed" onChange={e => setFormData({...formData, quantity: e.target.value})} />
                    <button onClick={() => { if(onSubmit) onSubmit(formData); onClose(); }} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Send Request</button>
                </div>
            </div>
        </div>
    );
};
export default MaterialRequestModal;