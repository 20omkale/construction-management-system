// src/modules/inventory/components/PurchaseOrderModal.jsx
import React, { useState } from 'react';
import { inventoryService } from '../services/inventory.service';

const PurchaseOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    projectId: '', supplierName: '', location: '', expectedDate: '', gst: '', 
    materialDesc: '', quantity: '', totalAmount: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Maps exactly to createPurchaseOrderSchema
    const payload = {
      projectId: formData.projectId, 
      title: `PO for ${formData.materialDesc}`, 
      type: 'MATERIAL',
      supplierName: formData.supplierName, 
      deliveryAddress: formData.location,
      expectedDelivery: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : undefined,
      items: [
        {
          description: formData.materialDesc,
          quantity: Number(formData.quantity) || 1,
          unit: 'nos', // Required by backend
          unitPrice: Number(formData.totalAmount) / (Number(formData.quantity) || 1),
          taxPercent: Number(formData.gst) || 0
        }
      ]
    };

    try {
      await inventoryService.createPurchaseOrder(payload);
      if(onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Validation failed. Check if Project ID is correct.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Figma Header (Red X) */}
        <div className="px-6 py-5 flex justify-between items-center bg-white border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create Purchase Order</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 bg-[#ff4d4f] text-white rounded-full flex justify-center items-center hover:bg-red-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 bg-gray-50/50 overflow-y-auto custom-scrollbar">
          {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mandatory Backend Field */}
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Project ID (Required by Backend) *</label>
              <input required type="text" placeholder="e.g. clu123abc" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#0f62fe] placeholder-blue-300 focus:ring-2 focus:ring-blue-100" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Supplier</label>
              <select required className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#0f62fe] appearance-none focus:ring-2 focus:ring-blue-100" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})}>
                <option value="">Select...</option>
                <option value="Supplier A">Supplier A</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Location</label>
              <input required type="text" placeholder="Enter location" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#0f62fe] placeholder-blue-300 focus:ring-2 focus:ring-blue-100" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1.5">Expected Date</label>
                <input required type="date" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-gray-500 focus:ring-2 focus:ring-blue-100" value={formData.expectedDate} onChange={e => setFormData({...formData, expectedDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">GST% (optional)</label>
                <input type="number" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-100" value={formData.gst} onChange={e => setFormData({...formData, gst: e.target.value})} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Material Description *</label>
                  <input required type="text" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-100" value={formData.materialDesc} onChange={e => setFormData({...formData, materialDesc: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Quantity *</label>
                  <input required type="number" min="1" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-100" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>
              <div className="w-full h-12 border-2 border-dashed border-[#0f62fe] rounded-xl opacity-30"></div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Total Amount</label>
              <input required type="number" min="1" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-gray-900 focus:ring-2 focus:ring-blue-100" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} />
            </div>

            <div className="pt-2 flex justify-center">
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#0f62fe] text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Create Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;