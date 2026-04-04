// src/modules/inventory/components/MaterialRequestModal.jsx
import React, { useState } from 'react';
import { inventoryService } from '../services/inventory.service';

const MaterialRequestModal = ({ isOpen, onClose, material }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    projectId: '', quantity: '', purpose: '', urgency: 'MEDIUM', expectedDelivery: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Payload exactly matching createMaterialRequestSchema
    const payload = {
      projectId: formData.projectId, // Required
      materialId: material?.id,
      materialName: material?.name,
      quantity: Number(formData.quantity), // Required
      unit: material?.unit || 'nos',
      purpose: formData.purpose, // Required
      urgency: formData.urgency,
      expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : undefined
    };

    try {
      await inventoryService.requestItem(payload);
      alert("Material Request Submitted Successfully!");
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to submit request. Ensure Project ID is correct.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f8f9fc] w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col">
        
        <div className="px-6 py-6 flex items-center justify-center relative bg-[#f8f9fc]">
          <button onClick={onClose} className="absolute left-6 text-gray-800 hover:text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-[22px] font-medium text-[#1a1a1a]">Request Material</h2>
        </div>

        <div className="p-6 pt-0">
          {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{errorMessage}</div>}

          <div className="mb-6 p-5 bg-[#00a887]/10 rounded-2xl border border-[#00a887]/20 text-center">
            <p className="text-[13px] text-[#00a887] font-bold mb-1">REQUESTING</p>
            <p className="text-xl font-black text-gray-900">{material?.name || 'Selected Material'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Project ID *</label>
              <input required type="text" placeholder="e.g. project-123" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100 placeholder-[#9ca3af]" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Quantity *</label>
                <input required type="number" min="1" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div>
                <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Urgency</label>
                <select className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100 appearance-none" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Expected Delivery</label>
              <input type="date" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-gray-500 focus:ring-2 focus:ring-blue-100" value={formData.expectedDelivery} onChange={e => setFormData({...formData, expectedDelivery: e.target.value})} />
            </div>

            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Purpose *</label>
              <textarea required className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100 resize-none" rows="2" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}></textarea>
            </div>

            <div className="pt-4 flex justify-center">
              <button type="submit" disabled={isSubmitting} className="px-10 py-3.5 bg-[#00a887] text-white font-bold rounded-xl shadow-md hover:bg-teal-600 transition-all disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestModal;