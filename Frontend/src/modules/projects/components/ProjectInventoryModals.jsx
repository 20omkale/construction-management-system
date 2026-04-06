// src/modules/projects/components/ProjectInventoryModals.jsx
import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';

// --- 1. MATERIAL INFO MODAL (Matches image_ae0c46.png) ---
export const MaterialInfoModal = ({ isOpen, onClose, material, onRequestClick }) => {
    if (!isOpen || !material) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-50">
                    <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">{material.name || 'Material Name'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-red-400 text-white hover:bg-red-500 rounded-full transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">Material Info</p>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Name:</span>
                            <span className="font-bold text-gray-900">{material.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Unit:</span>
                            <span className="font-bold text-gray-900">{material.unit}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Total cost:</span>
                            <span className="font-bold text-gray-900">₹{material.totalValue?.toLocaleString() || '0'}/-</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Total Quantity:</span>
                            <span className="font-bold text-gray-900">{material.quantityTotal || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Used:</span>
                            <span className="font-bold text-gray-900">{material.quantityUsed || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Remaining:</span>
                            <span className="font-bold text-gray-900">{material.quantityAvailable || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2 col-span-2">
                            <span className="text-gray-500">Cost per unit:</span>
                            <span className="font-bold text-gray-900">₹{material.averageRate || material.material?.unitPrice || 0}/{material.unit}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2 col-span-2">
                            <span className="text-gray-500">Low Stock Threshold:</span>
                            <span className="font-bold text-gray-900">{material.material?.minimumStock || 0}</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <button 
                            onClick={onRequestClick}
                            className="px-10 py-3 bg-[#00B69B] hover:bg-[#009b84] text-white text-[14px] font-bold rounded-xl transition-all shadow-md"
                        >
                            Request
                        </button>
                        <button className="px-10 py-3 bg-[#0066CC] hover:bg-[#0052a3] text-white text-[14px] font-bold rounded-xl transition-all shadow-md">
                            Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. REQUEST MATERIAL MODAL (Matches image_ae1006.png) ---
export const RequestMaterialModal = ({ isOpen, onClose, material, projectId, onSubmit }) => {
    const [quantity, setQuantity] = useState('');
    const [expectedDelivery, setExpectedDelivery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Auto-filling required backend fields to keep UI clean
            await onSubmit({
                projectId,
                materialId: material.materialId || material.id,
                quantity: parseFloat(quantity),
                unit: material.unit || material.material?.unit || 'Nos',
                purpose: 'Site Requirement', // Auto-filled for backend schema
                urgency: 'MEDIUM',
                expectedDelivery: expectedDelivery ? new Date(expectedDelivery).toISOString() : undefined
            });
            onClose();
        } catch (error) {
            alert(error.message || "Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onClose} className="text-gray-900 hover:text-gray-500">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h2 className="text-[24px] font-bold text-gray-900">Request Material</h2>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[16px] font-medium text-gray-900">Quantity to Request</label>
                        <input 
                            type="number" 
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-[#0066CC] rounded-2xl text-[16px] outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[16px] font-medium text-gray-900">Required Date</label>
                        <input 
                            type="date" 
                            value={expectedDelivery}
                            onChange={e => setExpectedDelivery(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-[#0066CC] rounded-2xl text-[16px] outline-none text-gray-600"
                        />
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || !quantity}
                            className="px-12 py-3.5 bg-[#00B69B] hover:bg-[#009b84] text-white text-[16px] font-medium rounded-2xl transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : 'Request'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};