// src/modules/inventory/components/GRNModal.jsx
import React, { useState } from 'react';
import { X, UploadCloud, FileIcon } from 'lucide-react';

const GRNModal = ({ isOpen, onClose, poId, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        receivedQuantity: '',
        qualityCheck: '',
        rateSupplier: '',
        remarks: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Constructing basic payload for the backend controller
            const payload = {
                purchaseOrderId: poId,
                notes: formData.remarks,
                items: [{
                    poItemId: "item-id-here", // In reality, this needs to be fetched from the PO details
                    receivedQuantity: parseFloat(formData.receivedQuantity) || 0,
                    qualityRating: formData.qualityCheck
                }]
            };
            
            await onSubmit(payload);
            onClose();
        } catch (error) {
            alert(error.message || "Failed to create GRN");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F0F4F8] w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
                    <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Create GRN</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-red-400 text-white hover:bg-red-500 rounded-xl transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        
                        {/* Top Info */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase">Location</p>
                                <p className="text-[14px] font-bold text-[#0066CC]">Supplier Name</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] text-gray-500">Sent: 13 Oct 2026</p>
                                <p className="text-[11px] text-gray-500">Received: 12 JAN 2026</p>
                            </div>
                        </div>

                        {/* Particulars Table */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">SR. NO.</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">PARTICULARS</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">ORDERED</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">RECEIVED</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-50">
                                        <td className="px-4 py-4 text-[13px] font-bold text-gray-900">01</td>
                                        <td className="px-4 py-4 text-[13px] font-medium text-gray-700">Particular 1</td>
                                        <td className="px-4 py-4 text-[13px] font-bold text-gray-900 text-center">Number</td>
                                        <td className="px-4 py-2 text-right">
                                            <input 
                                                type="number" 
                                                className="w-20 px-3 py-2 border border-[#8AB4F8] rounded-lg text-[13px] outline-none focus:border-[#0066CC] text-center ml-auto"
                                                onChange={e => setFormData({...formData, receivedQuantity: e.target.value})}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Dropdowns */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-600">Quality Check</label>
                                <select 
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none text-gray-600 bg-white focus:border-[#0066CC]"
                                    onChange={e => setFormData({...formData, qualityCheck: e.target.value})}
                                >
                                    <option value="">Select...</option>
                                    <option value="GOOD">Good</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-600">Rate Supplier</label>
                                <select 
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none text-gray-600 bg-white focus:border-[#0066CC]"
                                    onChange={e => setFormData({...formData, rateSupplier: e.target.value})}
                                >
                                    <option value="">Select...</option>
                                    <option value="5">5 Stars</option>
                                </select>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-600">Remarks</label>
                            <textarea 
                                rows="2"
                                className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] resize-none"
                                onChange={e => setFormData({...formData, remarks: e.target.value})} 
                            ></textarea>
                        </div>

                        {/* File Uploads */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-[13px] font-bold text-gray-600 mb-2">Upload Goods Photos</p>
                                <button type="button" className="w-20 h-20 border-2 border-dashed border-[#0066CC] rounded-xl flex items-center justify-center text-[#0066CC] hover:bg-blue-50 transition-colors">
                                    <Plus size={24} />
                                </button>
                            </div>
                            
                            <div>
                                <p className="text-[13px] font-bold text-gray-600 mb-2">Receipt</p>
                                <button type="button" className="flex items-center gap-2 px-4 py-2 border border-[#8AB4F8] text-[#0066CC] font-bold text-[13px] rounded-lg hover:bg-blue-50 transition-colors">
                                    <FileIcon size={16} /> Select file
                                </button>
                                <p className="text-[10px] text-gray-400 mt-1">Upload a jpeg, jpg, png, pdf no larger than 10 MB</p>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-[#0066CC] text-white text-[14px] font-bold rounded-xl hover:bg-[#0052a3] shadow-md transition-all active:scale-[0.98]">
                                {isSubmitting ? 'Processing...' : 'Create GRN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GRNModal;