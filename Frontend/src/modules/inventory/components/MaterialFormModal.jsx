// src/modules/inventory/components/MaterialFormModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const MaterialFormModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        unit: '', // REQUIRED BY BACKEND
        minimumStock: '',
        unitPrice: '',
        tax: '',
        supplier: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Map state to backend schema
            const payload = {
                name: formData.name,
                unit: formData.unit,
                stockQuantity: 0, // Default to 0 on creation
                minimumStock: parseFloat(formData.minimumStock) || 0,
                unitPrice: parseFloat(formData.unitPrice) || 0,
                supplier: formData.supplier
            };
            
            await onSubmit(payload);
            onClose();
        } catch (error) {
            alert(error.message || "Failed to create material");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F0F4F8] w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeftIcon />
                        </button>
                        <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Create Material</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-red-400 text-white hover:bg-red-500 rounded-xl transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                        
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-gray-700">Material Name</label>
                            <input 
                                required
                                placeholder="Enter the material name" 
                                className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-gray-700">Category</label>
                            <select 
                                className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] bg-white text-gray-600 transition-colors cursor-pointer"
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="">Select...</option>
                                <option value="Raw Material">Raw Material</option>
                                <option value="Consumables">Consumables</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-700">Unit (kg, ton, pcs)</label>
                                <input 
                                    required
                                    placeholder="e.g. Bags, Kg, Tons" 
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                    onChange={e => setFormData({...formData, unit: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-700">Low Stock Threshold</label>
                                <input 
                                    type="number"
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                    onChange={e => setFormData({...formData, minimumStock: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-700">Cost per Unit</label>
                                <input 
                                    type="number"
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                    onChange={e => setFormData({...formData, unitPrice: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-700">Tax %</label>
                                <input 
                                    type="number"
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                    onChange={e => setFormData({...formData, tax: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-gray-700">Supplier Name</label>
                            <select 
                                className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] bg-white text-gray-600 transition-colors cursor-pointer"
                                onChange={e => setFormData({...formData, supplier: e.target.value})}
                            >
                                <option value="">Select...</option>
                                <option value="Supplier A">Supplier A</option>
                                <option value="Supplier B">Supplier B</option>
                            </select>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-[#0066CC] text-white text-[14px] font-bold rounded-xl hover:bg-[#0052a3] shadow-md transition-all active:scale-[0.98]">
                                {isSubmitting ? 'Processing...' : 'Create Material'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const ArrowLeftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
);

export default MaterialFormModal;