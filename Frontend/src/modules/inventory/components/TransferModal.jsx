import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';

const TransferModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ from: '', to: '', item: '', qty: '' });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[24px] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <ArrowRightLeft className="text-blue-600" size={24}/>
                        <h2 className="text-xl font-bold">Stock Transfer</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-red-50 text-red-500 rounded-xl"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full p-3 border border-blue-100 rounded-xl" placeholder="From Site" onChange={e => setFormData({...formData, from: e.target.value})} />
                        <input className="w-full p-3 border border-blue-100 rounded-xl" placeholder="To Site" onChange={e => setFormData({...formData, to: e.target.value})} />
                    </div>
                    <input className="w-full p-3 border border-blue-100 rounded-xl" placeholder="Item Name" onChange={e => setFormData({...formData, item: e.target.value})} />
                    <button onClick={() => { if(onSubmit) onSubmit(formData); onClose(); }} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Initiate Transfer</button>
                </div>
            </div>
        </div>
    );
};
export default TransferModal;