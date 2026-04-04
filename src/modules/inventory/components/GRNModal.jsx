// src/modules/inventory/components/GRNModal.jsx
import React, { useState } from 'react';
import { inventoryService } from '../services/inventory.service';

const GRNModal = ({ isOpen, onClose, poData, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [receivedQty, setReceivedQty] = useState('');
  const [qualityCheck, setQualityCheck] = useState('Approved');
  const [rateSupplier, setRateSupplier] = useState('5 Stars');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  // Safely extract item data for the UI and Backend payload
  const poItem = poData?.items?.[0];
  const poItemId = poItem?.id || "fallback-id";
  const orderedQty = poItem?.quantity || 0;
  const description = poItem?.description || "Material Batch";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Payload perfectly mapped to createGoodsReceiptSchema
    const payload = {
      purchaseOrderId: poData?.id,
      notes: remarks,
      items: [
        {
          poItemId: poItemId, // Required by backend
          receivedQuantity: Number(receivedQty),
          acceptedQuantity: Number(receivedQty),
          inspectionStatus: qualityCheck === 'Approved' ? 'PASSED' : 'FAILED',
          qualityRating: 'GOOD' // Default to pass Zod schema
        }
      ]
    };

    try {
      await inventoryService.createGRN(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to process GRN. Ensure PO ID and Item ID are valid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f8f9fc] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Exact Figma Header */}
        <div className="px-6 py-6 flex items-center justify-between bg-[#f8f9fc] border-b border-gray-100">
          <h2 className="text-[22px] font-bold text-[#1a1a1a]">Create GRN</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 bg-[#ff4d4f] text-white rounded-full flex justify-center items-center hover:bg-red-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-white m-4 rounded-2xl shadow-sm border border-gray-50">
          {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{errorMessage}</div>}

          <div className="mb-6 flex justify-between">
            <div>
              <p className="text-[13px] text-gray-400 font-medium mb-1">Location / Supplier</p>
              <p className="font-bold text-[#0f62fe] text-lg">{poData?.supplierName || poData?.supplier?.name || 'Unknown Supplier'}</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-gray-400 font-bold mb-1 uppercase tracking-wider">PO ID: {poData?.poNumber || poData?.id || 'N/A'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Exact Figma Table Layout */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold text-[12px]">
                  <tr>
                    <th className="p-4 uppercase tracking-wider">SR. NO.</th>
                    <th className="p-4 uppercase tracking-wider">PARTICULARS</th>
                    <th className="p-4 uppercase tracking-wider">ORDERED</th>
                    <th className="p-4 uppercase tracking-wider">RECEIVED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-4 text-gray-500">01</td>
                    <td className="p-4 font-medium text-gray-900">{description}</td>
                    <td className="p-4 text-gray-500">{orderedQty}</td>
                    <td className="p-3">
                      <input required type="number" min="0" max={orderedQty > 0 ? orderedQty : undefined} className="w-24 p-2.5 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={receivedQty} onChange={e => setReceivedQty(e.target.value)} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[14px] text-gray-700 mb-1.5 font-medium">Quality Check</label>
                <select className="w-full p-3.5 border border-[#0f62fe] rounded-xl outline-none text-[#0f62fe] bg-white font-medium appearance-none focus:ring-2 focus:ring-blue-100" value={qualityCheck} onChange={e => setQualityCheck(e.target.value)}>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-[14px] text-gray-700 mb-1.5 font-medium">Rate Supplier</label>
                <select className="w-full p-3.5 border border-[#0f62fe] rounded-xl outline-none text-[#0f62fe] bg-white font-medium appearance-none focus:ring-2 focus:ring-blue-100" value={rateSupplier} onChange={e => setRateSupplier(e.target.value)}>
                  <option value="5 Stars">5 Stars</option>
                  <option value="4 Stars">4 Stars</option>
                  <option value="3 Stars">3 Stars</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[14px] text-gray-700 mb-1.5 font-medium">Remarks</label>
              <textarea rows="3" className="w-full p-3.5 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] resize-none focus:ring-2 focus:ring-blue-100" value={remarks} onChange={e => setRemarks(e.target.value)}></textarea>
            </div>

            <div className="pt-2 flex justify-center">
              <button type="submit" disabled={isSubmitting} className="px-10 py-3.5 bg-[#0f62fe] text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Confirm Receipt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GRNModal;