// src/modules/inventory/components/GRNModal.jsx
import React, { useState, useEffect } from 'react';
import { X, FileIcon, Plus, ChevronDown, Loader2 } from 'lucide-react';
import api from '../../../shared/utils/api';

const GRNModal = ({ isOpen, onClose, poId, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [poData, setPoData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form States
    const [formData, setFormData] = useState({
        qualityCheck: 'EXCELLENT',
        rateSupplier: '5',
        remarks: ''
    });

    const [itemQuantities, setItemQuantities] = useState({});
    const [goodsPhoto, setGoodsPhoto] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);

    useEffect(() => {
        if (isOpen && poId) {
            const fetchPODetails = async () => {
                setIsLoading(true);
                try {
                    const response = await api.get(`/purchase-orders/${poId}`);
                    const data = response.data?.data || response.data;
                    setPoData(data);
                    
                    const items = data?.PurchaseOrderItem || data?.items || [];
                    const initialQuantities = {};
                    items.forEach(item => {
                        initialQuantities[item.id] = item.pendingQuantity > 0 ? item.pendingQuantity : 0;
                    });
                    setItemQuantities(initialQuantities);

                } catch (error) {
                    console.error("Error fetching PO details:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPODetails();
        }
    }, [isOpen, poId]);

    if (!isOpen) return null;

    const poItems = poData?.PurchaseOrderItem || poData?.items || [];
    const totalOrdered = poItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalReceivedInput = poItems.reduce((sum, item) => sum + (parseFloat(itemQuantities[item.id]) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (poItems.length === 0) throw new Error("No items found in this PO.");

            const payloadItems = poItems
                .map(item => ({
                    poItemId: item.id,
                    receivedQuantity: parseFloat(itemQuantities[item.id]) || 0,
                    qualityRating: formData.qualityCheck,
                    supplierRating: parseInt(formData.rateSupplier)
                }))
                .filter(item => item.receivedQuantity > 0);

            if (payloadItems.length === 0) {
                throw new Error("You must receive at least 1 quantity of an item.");
            }

            const payload = {
                purchaseOrderId: poId,
                notes: formData.remarks,
                receivedAt: new Date().toISOString(),
                items: payloadItems
            };
            
            await onSubmit(payload);
            onClose();
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuantityChange = (itemId, value) => {
        setItemQuantities(prev => ({
            ...prev,
            [itemId]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[650px] rounded-[16px] shadow-2xl overflow-hidden flex flex-col border border-gray-100">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                    <h2 className="text-[20px] font-bold text-gray-900">Create GRN</h2>
                    <button onClick={onClose} className="bg-[#FF4D4F] text-white rounded-md p-1.5 hover:bg-red-600 transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-8 pb-8 overflow-y-auto max-h-[85vh] custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" />
                            <p className="text-xs text-gray-500 font-medium">Loading PO details...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Top Info Header */}
                            <div className="flex justify-between items-start text-[12px] mb-2 pt-2">
                                <div className="space-y-1">
                                    <p className="text-gray-400 font-medium">Location</p>
                                    <p className="text-[#0066CC] font-medium">{poData?.supplier?.name || poData?.supplier?.companyName || 'Supplier Name'}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-gray-400">Sent: <span className="text-gray-600 ml-1">{poData?.createdAt ? new Date(poData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span></p>
                                    <p className="text-gray-400">Received: <span className="text-gray-600 ml-1">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span></p>
                                </div>
                            </div>

                            {/* Dynamic Items Table */}
                            <div className="w-full">
                                <table className="w-full text-left text-[12px]">
                                    <thead className="border-b border-gray-200 text-gray-500 uppercase">
                                        <tr>
                                            <th className="py-3 font-medium w-[15%]">SR. NO.</th>
                                            <th className="py-3 font-medium w-[40%]">PARTICULARS</th>
                                            <th className="py-3 font-medium w-[25%]">ORDERED</th>
                                            <th className="py-3 font-medium w-[20%] text-right pr-2">RECEIVED</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {poItems.map((item, idx) => (
                                            <tr key={item.id} className="border-b border-gray-100">
                                                <td className="py-4 font-medium text-gray-900">{String(idx + 1).padStart(2, '0')}</td>
                                                <td className="py-4 text-gray-700 font-medium">
                                                    {item.material?.name || item.description || 'Item'}
                                                </td>
                                                <td className="py-4 text-gray-700">{item.quantity}</td>
                                                <td className="py-4 text-right">
                                                    <input 
                                                        required={item.pendingQuantity > 0}
                                                        type="number" 
                                                        step="any"
                                                        max={item.pendingQuantity}
                                                        disabled={item.pendingQuantity === 0}
                                                        value={itemQuantities[item.id] ?? ''} 
                                                        onChange={e => handleQuantityChange(item.id, e.target.value)} 
                                                        className="w-16 px-2 py-1.5 border border-[#0066CC] rounded-md outline-none text-center inline-block text-gray-900 disabled:border-gray-200 disabled:bg-gray-50" 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        
                                        <tr>
                                            <td className="py-4 font-bold text-gray-900" colSpan="2">Total</td>
                                            <td className="py-4 font-bold text-gray-900">{totalOrdered}</td>
                                            <td className="py-4 font-bold text-gray-900 text-right pr-2">{totalReceivedInput}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Dropdowns - Fully Functional and Styled */}
                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2 relative">
                                    <label className="text-[13px] text-gray-700">Quality Check</label>
                                    <div className="relative">
                                        <select value={formData.qualityCheck} onChange={e => setFormData({...formData, qualityCheck: e.target.value})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] outline-none appearance-none bg-white text-gray-900">
                                            <option value="EXCELLENT">Excellent</option>
                                            <option value="GOOD">Good</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0066CC] pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-[13px] text-gray-700">Rate Supplier</label>
                                    <div className="relative">
                                        <select value={formData.rateSupplier} onChange={e => setFormData({...formData, rateSupplier: e.target.value})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] outline-none appearance-none bg-white text-gray-900">
                                            <option value="5">5 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="2">2 Stars</option>
                                            <option value="1">1 Star</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0066CC] pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="space-y-2">
                                <label className="text-[13px] text-gray-700">Remarks</label>
                                <input type="text" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full px-4 py-6 border border-[#0066CC] rounded-lg text-[14px] outline-none text-gray-900" />
                            </div>

                            {/* Uploads */}
                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[13px] text-gray-700">Upload Goods Photos</label>
                                    <label className="w-20 h-20 border border-dashed border-[#0066CC] rounded-md flex items-center justify-center text-[#0066CC] cursor-pointer hover:bg-blue-50 transition-colors">
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setGoodsPhoto(e.target.files[0])} />
                                        <Plus size={24} strokeWidth={1.5} />
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] text-gray-700">Receipt</label>
                                    <div>
                                        <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#0066CC] rounded-md text-[#0066CC] text-[13px] font-medium bg-white cursor-pointer hover:bg-blue-50 transition-colors">
                                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => setReceiptFile(e.target.files[0])} />
                                            <FileIcon size={16} strokeWidth={2} /> Select file
                                        </label>
                                        <p className="text-[9px] text-gray-500 mt-2 font-medium">Upload a jpeg, jpg, png, pdf no larger than 10 MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-center">
                                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[#0066CC] text-white text-[14px] font-medium rounded-md hover:bg-[#0052a3] transition-colors disabled:opacity-50">
                                    {isSubmitting ? 'Processing...' : 'Create GRN'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GRNModal;