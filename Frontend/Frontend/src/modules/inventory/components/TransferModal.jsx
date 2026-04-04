// src/modules/inventory/components/TransferModal.jsx
import React, { useState } from 'react';
import { inventoryService } from '../services/inventory.service';

const TransferModal = ({ isOpen, onClose, itemData, type = 'MATERIAL', onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({ toProjectId: '', quantity: '', notes: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Payload exactly matching createTransferSchema
    const payload = {
      fromLocation: 'GLOBAL',
      toLocation: 'PROJECT',
      toProjectId: formData.toProjectId, // Required
      description: formData.notes || undefined,
      items: [
        {
          itemType: type, // 'MATERIAL' or 'EQUIPMENT'
          materialId: type === 'MATERIAL' ? itemData?.id : undefined,
          equipmentId: type === 'EQUIPMENT' ? itemData?.id : undefined,
          quantity: type === 'MATERIAL' ? Number(formData.quantity) : 1
        }
      ]
    };

    try {
      await inventoryService.transferItem(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to transfer item. Verify Destination Project ID.");
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
          <h2 className="text-[22px] font-medium text-[#1a1a1a]">Transfer {type === 'MATERIAL' ? 'Material' : 'Equipment'}</h2>
        </div>

        <div className="p-6 pt-0">
          {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{errorMessage}</div>}
          
          <div className="mb-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
            <p className="text-[13px] text-gray-500 font-medium mb-1">ITEM TO TRANSFER</p>
            <p className="text-xl font-bold text-[#0f62fe]">{itemData?.name || 'Selected Item'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Destination Project ID *</label>
              <input required type="text" placeholder="e.g. project-123" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100 placeholder-[#9ca3af]" value={formData.toProjectId} onChange={e => setFormData({...formData, toProjectId: e.target.value})} />
            </div>

            {type === 'MATERIAL' && (
              <div>
                <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Quantity to Transfer *</label>
                <input required type="number" min="1" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
              </div>
            )}

            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Notes (Optional)</label>
              <textarea className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100 resize-none" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
            </div>

            <div className="pt-4 flex justify-center">
              <button type="submit" disabled={isSubmitting} className="px-10 py-3.5 bg-[#0f62fe] text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;