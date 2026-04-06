// src/modules/inventory/components/PurchaseOrderModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getMaterialsAPI, getAllSuppliersAPI } from '../services/inventory.service';
import { getAllProjectsAPI } from '../../projects/services/project.service';

const PurchaseOrderModal = ({ isOpen, onClose, onSubmit }) => {
    const [projects, setProjects] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [suppliers, setSuppliers] = useState([]); // Real Suppliers State
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        projectId: '',
        supplierId: '',
        deliveryAddress: '',
        expectedDelivery: '',
        taxRate: '',
        materialId: '',
        quantity: '',
        totalAmount: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchRelatedData = async () => {
                setIsLoadingData(true);
                try {
                    // Fetch all interconnected entities simultaneously
                    const [projRes, matRes, supRes] = await Promise.all([
                        getAllProjectsAPI(),
                        getMaterialsAPI(),
                        getAllSuppliersAPI()
                    ]);

                    if (projRes.success) setProjects(projRes.data);
                    if (matRes.success) setMaterials(matRes.data);
                    if (supRes.success) setSuppliers(supRes.data);
                } catch (error) {
                    console.error("Data fetch error:", error);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchRelatedData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const selectedMaterial = materials.find(m => m.id === formData.materialId);
            const materialName = selectedMaterial ? selectedMaterial.name : 'Material';
            const materialUnit = selectedMaterial ? selectedMaterial.unit : 'Nos';

            // NO HARDCODING: Using real IDs from the dropdown selections
            const payload = {
                projectId: formData.projectId,
                supplierId: formData.supplierId, 
                title: `PO for ${materialName}`,
                deliveryAddress: formData.deliveryAddress || 'Site Location',
                expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : undefined,
                taxRate: parseFloat(formData.taxRate) || 0,
                items: [{
                    materialId: formData.materialId,
                    description: `Order of ${formData.quantity} ${materialUnit} of ${materialName}`,
                    unit: materialUnit,
                    quantity: parseFloat(formData.quantity) || 0,
                    unitPrice: parseFloat(formData.totalAmount) / (parseFloat(formData.quantity) || 1)
                }]
            };
            
            await onSubmit(payload);
            onClose();
        } catch (error) {
            alert(error.message || "Failed to create PO");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F0F4F8] w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-8 pt-8 pb-4">
                    <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Create Purchase Order</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-red-400 text-white hover:bg-red-500 rounded-xl transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-8 pb-8">
                    {isLoadingData ? (
                        <div className="bg-white p-10 rounded-2xl flex flex-col justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC]"></div>
                            <span className="mt-3 text-gray-500 font-bold text-sm text-center">Synchronizing Projects, Materials & Suppliers...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-600">Project</label>
                                    <select 
                                        required
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none text-gray-900 bg-white focus:border-[#0066CC]"
                                        onChange={e => setFormData({...formData, projectId: e.target.value})}
                                    >
                                        <option value="">Select Project...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-600">Supplier</label>
                                    <select 
                                        required
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none text-gray-900 bg-white focus:border-[#0066CC]"
                                        onChange={e => setFormData({...formData, supplierId: e.target.value})}
                                    >
                                        <option value="">Select Supplier...</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-600">Delivery Location</label>
                                <input 
                                    placeholder="Enter site location" 
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC]"
                                    onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-600">Expected Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC] text-gray-600"
                                        onChange={e => setFormData({...formData, expectedDelivery: e.target.value})} 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-600">GST% (optional)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC]"
                                        onChange={e => setFormData({...formData, taxRate: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-5 items-start p-4 bg-gray-50/50 rounded-xl border border-dashed border-[#8AB4F8]">
                                <div className="col-span-3 space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-600">Material</label>
                                    <select 
                                        required
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none text-gray-900 bg-white focus:border-[#0066CC]"
                                        onChange={e => setFormData({...formData, materialId: e.target.value})}
                                    >
                                        <option value="">Select Material...</option>
                                        {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1 space-y-1.5">
                                    <label className="text-[13px] font-bold text-gray-600">Qty</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC]"
                                        onChange={e => setFormData({...formData, quantity: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-600">Total Amount (₹)</label>
                                <input 
                                    required
                                    type="number" 
                                    className="w-full px-4 py-3 border border-[#8AB4F8] rounded-xl text-[14px] outline-none focus:border-[#0066CC]"
                                    onChange={e => setFormData({...formData, totalAmount: e.target.value})} 
                                />
                            </div>

                            <div className="pt-4 flex justify-center">
                                <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-[#0066CC] text-white text-[14px] font-bold rounded-xl hover:bg-[#0052a3] shadow-md transition-all active:scale-[0.98]">
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