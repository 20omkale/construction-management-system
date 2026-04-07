// src/modules/inventory/components/PurchaseOrderModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, ChevronDown, Loader2 } from 'lucide-react';
import api from '../../../shared/utils/api';

const PurchaseOrderModal = ({ isOpen, onClose, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // Dynamic Data States
    const [suppliers, setSuppliers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [materials, setMaterials] = useState([]);

    const [formData, setFormData] = useState({
        supplierId: '',
        projectId: '', 
        expectedDelivery: '',
        taxRate: '',
        totalAmount: '',
        items: [{ materialId: '', quantity: '' }]
    });

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoadingData(true);
                try {
                    const [supRes, projRes, matRes] = await Promise.all([
                        api.get('/suppliers').catch(() => ({ data: [] })),
                        api.get('/projects').catch(() => ({ data: [] })),
                        api.get('/inventory/materials').catch(() => ({ data: [] }))
                    ]);
                    
                    const supData = supRes.data?.data || supRes.data || [];
                    const projData = projRes.data?.data || projRes.data || [];
                    const matData = matRes.data?.data || matRes.data || [];

                    setSuppliers(Array.isArray(supData) ? supData : []);
                    setProjects(Array.isArray(projData) ? projData : []);
                    setMaterials(Array.isArray(matData) ? matData : []);
                } catch (error) {
                    console.error("Error fetching form data:", error);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const primaryItem = formData.items[0];
            const selectedMaterial = materials.find(m => m.id === primaryItem.materialId);
            const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);

            const payload = {
                title: `Order from ${selectedSupplier?.name || selectedSupplier?.companyName || 'Supplier'}`,
                projectId: formData.projectId,
                supplierId: formData.supplierId,
                supplierName: selectedSupplier?.name || selectedSupplier?.companyName || 'Unknown',
                expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : undefined,
                taxRate: parseFloat(formData.taxRate) || 0,
                totalAmount: parseFloat(formData.totalAmount) || 0,
                items: [{
                    description: selectedMaterial?.name || "Material",
                    materialId: primaryItem.materialId,
                    quantity: parseFloat(primaryItem.quantity),
                    unit: selectedMaterial?.unit || "NOS",
                    unitPrice: (parseFloat(formData.totalAmount) || 0) / (parseFloat(primaryItem.quantity) || 1),
                }]
            };

            await onSubmit(payload);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create PO.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[650px] rounded-[16px] shadow-2xl overflow-hidden flex flex-col border border-gray-100">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                    <h2 className="text-[20px] font-bold text-gray-900">Create Purchase Order</h2>
                    <button onClick={onClose} className="bg-[#FF4D4F] text-white rounded-md p-1.5 hover:bg-red-600 transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="px-8 pb-8">
                    {isLoadingData ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" />
                            <p className="text-xs text-gray-500 font-medium">Loading form data...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            <div className="space-y-1.5 relative">
                                <label className="text-[13px] text-gray-700">Supplier</label>
                                <div className="relative">
                                    <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] text-[#0066CC] outline-none appearance-none bg-transparent font-medium">
                                        <option value="" disabled>Select Supplier...</option>
                                        {/* 🚨 DYNAMIC SUPPLIERS */}
                                        {suppliers.map(s => <option key={s.id} value={s.id} className="text-gray-900 font-normal">{s.name || s.companyName}</option>)}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0066CC] pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5 relative">
                                <label className="text-[13px] text-gray-700">Location</label>
                                <div className="relative">
                                    <select required value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] outline-none appearance-none bg-transparent">
                                        <option value="" disabled className="text-gray-400">Select Project Location...</option>
                                        {/* 🚨 DYNAMIC PROJECTS */}
                                        {projects.map(p => <option key={p.id} value={p.id} className="text-gray-900">{p.name}</option>)}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0066CC] pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 relative">
                                    <label className="text-[13px] text-gray-700">Expected Date</label>
                                    <div className="relative">
                                        <input required type="date" value={formData.expectedDelivery} onChange={e => setFormData({...formData, expectedDelivery: e.target.value})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] text-gray-700 outline-none bg-transparent pl-4 pr-10" />
                                        <CalendarIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0066CC] pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] text-gray-700">GST% (optional)</label>
                                    <input type="number" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: e.target.value})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] outline-none text-gray-700" />
                                </div>
                            </div>

                            {/* Material Box */}
                            <div className="bg-[#F8FAFC] rounded-[12px] p-5 border border-gray-100">
                                <div className="flex gap-4">
                                    <div className="space-y-1.5 w-[75%] relative">
                                        <label className="text-[13px] text-gray-700">Material</label>
                                        <div className="relative">
                                            <select required value={formData.items[0].materialId} onChange={e => setFormData({...formData, items: [{...formData.items[0], materialId: e.target.value}]})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] outline-none bg-white appearance-none text-gray-900">
                                                <option value="" disabled>Select Material...</option>
                                                {/* 🚨 DYNAMIC MATERIALS */}
                                                {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0066CC] pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 w-[25%]">
                                        <label className="text-[13px] text-gray-700">Quantity</label>
                                        <input required type="number" min="0.01" step="any" value={formData.items[0].quantity} onChange={e => setFormData({...formData, items: [{...formData.items[0], quantity: e.target.value}]})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] outline-none bg-white text-gray-900" />
                                    </div>
                                </div>
                                <div className="mt-5 border border-dashed border-[#0066CC] rounded-lg h-12 w-[75%] bg-white/50"></div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-700">Total Amount</label>
                                <input required type="number" min="0" step="any" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="w-full px-4 py-2.5 border border-[#0066CC] rounded-lg text-[14px] outline-none text-gray-900" />
                            </div>

                            <div className="pt-6 flex justify-center">
                                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[#0066CC] text-white text-[14px] font-medium rounded-md hover:bg-[#0052a3] transition-colors disabled:opacity-50">
                                    {isSubmitting ? 'Processing...' : 'Create Purchase Order'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderModal;