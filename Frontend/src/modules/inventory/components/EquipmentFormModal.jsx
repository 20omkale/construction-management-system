// src/modules/inventory/components/EquipmentFormModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const EquipmentFormModal = ({ isOpen, onClose, onSubmit }) => {
    const [type, setType] = useState('OWNED'); // 'OWNED' or 'RENTED'
    
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        purchaseCost: '',
        purchaseDate: '',
        rentPerDay: '',
        startDate: '',
        endDate: '',
        fuelType: '',
        fuelCost: '',
        avgConsumption: ''
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
                type: type,
                // Add conditional fields based on type
                ...(type === 'OWNED' ? {
                    purchaseCost: parseFloat(formData.purchaseCost) || 0,
                    purchaseDate: formData.purchaseDate
                } : {
                    rentPerDay: parseFloat(formData.rentPerDay) || 0,
                    startDate: formData.startDate,
                    endDate: formData.endDate
                }),
                fuelType: formData.fuelType,
                fuelCost: parseFloat(formData.fuelCost) || 0,
                avgConsumption: parseFloat(formData.avgConsumption) || 0
            };
            
            await onSubmit(payload);
            onClose();
        } catch (error) {
            alert(error.message || "Failed to create equipment");
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
                        <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Create Equipment</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-red-400 text-white hover:bg-red-500 rounded-xl transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                        
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-gray-700">Equipment Name</label>
                            <input 
                                required
                                placeholder="Enter the equipment name" 
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
                                <option value="Heavy Machinery">Heavy Machinery</option>
                                <option value="Vehicles">Vehicles</option>
                            </select>
                        </div>

                        {/* Owned / Rented Radio Toggle */}
                        <div className="flex justify-center items-center gap-12 py-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="eqType" 
                                    value="OWNED"
                                    checked={type === 'OWNED'}
                                    onChange={() => setType('OWNED')}
                                    className="w-4 h-4 text-[#0066CC] focus:ring-[#0066CC] cursor-pointer"
                                />
                                <span className="text-[14px] font-medium text-gray-900">Owned</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="eqType" 
                                    value="RENTED"
                                    checked={type === 'RENTED'}
                                    onChange={() => setType('RENTED')}
                                    className="w-4 h-4 text-[#0066CC] focus:ring-[#0066CC] cursor-pointer"
                                />
                                <span className="text-[14px] font-medium text-gray-900">Rented</span>
                            </label>
                        </div>

                        {/* Conditional Fields based on Toggle */}
                        {type === 'OWNED' ? (
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-gray-700">Purchase Cost</label>
                                    <input 
                                        type="number"
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                        onChange={e => setFormData({...formData, purchaseCost: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-gray-700">Purchase Date</label>
                                    <input 
                                        type="date"
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors text-gray-600"
                                        onChange={e => setFormData({...formData, purchaseDate: e.target.value})} 
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-gray-700">Rent Per Day</label>
                                    <input 
                                        type="number"
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                        onChange={e => setFormData({...formData, rentPerDay: e.target.value})} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-medium text-gray-700">Start date</label>
                                        <input 
                                            type="date"
                                            className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors text-gray-600"
                                            onChange={e => setFormData({...formData, startDate: e.target.value})} 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-medium text-gray-700">End date</label>
                                        <input 
                                            type="date"
                                            className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors text-gray-600"
                                            onChange={e => setFormData({...formData, endDate: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-700">Fuel Type</label>
                                <input 
                                    placeholder="e.g. Diesel"
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                    onChange={e => setFormData({...formData, fuelType: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-gray-700">Fuel Cost per Litre</label>
                                <input 
                                    type="number"
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                    onChange={e => setFormData({...formData, fuelCost: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-gray-700">Avg Consumption Per Day</label>
                            <input 
                                type="number"
                                className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] transition-colors"
                                onChange={e => setFormData({...formData, avgConsumption: e.target.value})} 
                            />
                        </div>

                        <div className="pt-4 flex justify-center">
                            <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-[#0066CC] text-white text-[14px] font-bold rounded-xl hover:bg-[#0052a3] shadow-md transition-all active:scale-[0.98]">
                                {isSubmitting ? 'Processing...' : 'Create Equipment'}
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

export default EquipmentFormModal;