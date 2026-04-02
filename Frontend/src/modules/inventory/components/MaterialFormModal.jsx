// src/modules/inventory/components/MaterialFormModal.jsx
import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventory.service';

const MaterialFormModal = ({ isOpen, onClose, onSuccess, editId = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', category: '', hsnCode: '', minimumStock: '', unitPrice: '', supplier: '', unit: 'nos'
  });

  useEffect(() => {
    setErrorMessage('');
    if (isOpen && editId) {
      inventoryService.getMaterialById(editId).then(res => {
        if (res.success) setFormData(res.data);
      }).catch(() => setErrorMessage('Failed to load material data.'));
    } else if (isOpen) {
      setFormData({ name: '', category: '', hsnCode: '', minimumStock: '', unitPrice: '', supplier: '', unit: 'nos' });
    }
  }, [isOpen, editId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Maps exactly to createMaterialSchema in material.validation.js
    const payload = {
      name: formData.name,
      unit: formData.unit,
      materialCode: formData.hsnCode || undefined,
      minimumStock: Number(formData.minimumStock) || 0,
      unitPrice: Number(formData.unitPrice) || 0,
      supplier: formData.supplier || undefined
    };

    try {
      if (editId) await inventoryService.updateMaterial(editId, payload);
      else await inventoryService.createMaterial(payload);
      if(onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to save material. Please ensure the code is unique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f8f9fc] w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Exact Figma Header */}
        <div className="px-6 py-6 flex items-center justify-center relative bg-[#f8f9fc]">
          <button onClick={onClose} className="absolute left-6 text-gray-800 hover:text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-[22px] font-medium text-[#1a1a1a]">{editId ? 'Edit Material' : 'Create Material'}</h2>
        </div>

        <div className="p-6 pt-0 overflow-y-auto">
          {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Material Name *</label>
              <input required type="text" placeholder="Enter the material name" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] placeholder-[#9ca3af] focus:ring-2 focus:ring-blue-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Category</label>
              <select className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#0f62fe] font-medium appearance-none focus:ring-2 focus:ring-blue-100" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value=""></option>
                <option value="Cement">Cement</option>
                <option value="Steel">Steel</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">HSN Code</label>
                <input type="text" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} />
              </div>
              <div>
                <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Low Stock Threshold</label>
                <input type="number" min="0" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Cost per Unit</label>
                <input type="number" min="0" step="0.01" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} />
              </div>
              <div>
                <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Unit</label>
                <select required className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                  <option value="nos">Nos</option>
                  <option value="kg">KG</option>
                  <option value="ton">Ton</option>
                  <option value="bags">Bags</option>
                  <option value="liters">Liters</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Supplier Name</label>
              <select className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#0f62fe] font-medium appearance-none focus:ring-2 focus:ring-blue-100" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})}>
                <option value=""></option>
                <option value="Supplier A">Supplier A</option>
                <option value="Supplier B">Supplier B</option>
              </select>
            </div>

            <div className="pt-4 flex justify-center">
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#0f62fe] text-white font-bold rounded-full shadow-sm hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : (editId ? 'Update Material' : 'Create Material')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialFormModal;