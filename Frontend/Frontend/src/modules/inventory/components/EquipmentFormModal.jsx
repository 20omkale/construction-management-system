// src/modules/inventory/components/EquipmentFormModal.jsx
import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventory.service';

const EquipmentFormModal = ({ isOpen, onClose, onSuccess, editId = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', type: '', code: '', ownershipType: 'OWNED', 
    purchaseCost: '', purchaseDate: '', fuelType: '', fuelConsumption: '',
    rentalProvider: '', rentalRate: '', rentalUnit: 'DAY', startDate: '', endDate: ''
  });

  useEffect(() => {
    setErrorMessage('');
    if (isOpen && editId) {
      inventoryService.getEquipmentById(editId).then(res => { 
        if (res.success) setFormData(res.data); 
      }).catch(() => setErrorMessage('Failed to load equipment data.'));
    } else if (isOpen) {
      setFormData({ 
        name: '', type: '', code: '', ownershipType: 'OWNED', 
        purchaseCost: '', purchaseDate: '', fuelType: '', fuelConsumption: '',
        rentalProvider: '', rentalRate: '', rentalUnit: 'DAY', startDate: '', endDate: ''
      });
    }
  }, [isOpen, editId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Maps exactly to createEquipmentSchema
    let payload = {
      name: formData.name,
      type: formData.type || 'Heavy Machinery',
      ownershipType: formData.ownershipType,
    };

    if (formData.ownershipType === 'OWNED') {
      payload.purchaseCost = Number(formData.purchaseCost) || 0;
      if (formData.purchaseDate) payload.purchaseDate = new Date(formData.purchaseDate).toISOString();
      if (formData.fuelType) payload.fuelType = formData.fuelType.toUpperCase();
      payload.fuelConsumption = Number(formData.fuelConsumption) || 0;
    } else {
      payload.rentalProvider = formData.rentalProvider || undefined;
      payload.rentalRate = Number(formData.rentalRate) || 0;
      payload.rentalUnit = formData.rentalUnit;
    }

    try {
      if (editId) await inventoryService.updateEquipment(editId, payload);
      else await inventoryService.createEquipment(payload);
      if(onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to save equipment. Check required fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f8f9fc] w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Figma Header */}
        <div className="px-6 py-6 flex items-center justify-center relative bg-[#f8f9fc]">
          <button onClick={onClose} className="absolute left-6 text-gray-800 hover:text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-[22px] font-medium text-[#1a1a1a]">{editId ? 'Edit Equipment' : 'Create Equipment'}</h2>
        </div>

        <div className="p-6 pt-0 overflow-y-auto custom-scrollbar">
          {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Equipment Name *</label>
              <input required type="text" placeholder="Enter the equipment name" className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] placeholder-[#9ca3af] focus:ring-2 focus:ring-blue-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-[15px] text-[#1a1a1a] mb-1.5 font-medium">Category</label>
              <select className="w-full p-3.5 bg-white border border-[#0f62fe] rounded-xl outline-none text-[#0f62fe] font-medium appearance-none focus:ring-2 focus:ring-blue-100" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value=""></option>
                <option value="Crane">Crane</option>
                <option value="Excavator">Excavator</option>
                <option value="Generator">Generator</option>
              </select>
            </div>

            {/* Fully Functional Radio Buttons */}
            <div className="flex items-center justify-center gap-12 py-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.ownershipType === 'OWNED' ? 'border-black' : 'border-gray-800'}`}>
                  {formData.ownershipType === 'OWNED' && <div className="w-2.5 h-2.5 bg-[#0f62fe] rounded-full"></div>}
                </div>
                <span className="text-[15px] font-medium text-[#1a1a1a]">Owned</span>
                <input type="radio" className="hidden" name="ownershipType" value="OWNED" checked={formData.ownershipType === 'OWNED'} onChange={(e) => setFormData({...formData, ownershipType: e.target.value})} />
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.ownershipType === 'RENTED' ? 'border-[#0f62fe]' : 'border-gray-800'}`}>
                  {formData.ownershipType === 'RENTED' && <div className="w-2.5 h-2.5 bg-[#0f62fe] rounded-full"></div>}
                </div>
                <span className="text-[15px] font-medium text-[#1a1a1a]">Rented</span>
                <input type="radio" className="hidden" name="ownershipType" value="RENTED" checked={formData.ownershipType === 'RENTED'} onChange={(e) => setFormData({...formData, ownershipType: e.target.value})} />
              </label>
            </div>

            {formData.ownershipType === 'OWNED' ? (
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] mb-1.5 font-medium">Purchase Cost (₹)</label>
                    <input type="number" min="0" className="w-full p-3 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.purchaseCost} onChange={e => setFormData({...formData, purchaseCost: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] mb-1.5 font-medium">Purchase Date</label>
                    <input type="date" className="w-full p-3 border border-[#0f62fe] rounded-xl outline-none text-gray-500 focus:ring-2 focus:ring-blue-100" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div>
                  <label className="block text-[14px] text-[#1a1a1a] mb-1.5 font-medium">Rental Provider</label>
                  <input type="text" className="w-full p-3 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.rentalProvider} onChange={e => setFormData({...formData, rentalProvider: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] mb-1.5 font-medium">Rental Rate (₹)</label>
                    <input type="number" min="0" className="w-full p-3 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.rentalRate} onChange={e => setFormData({...formData, rentalRate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a1a] mb-1.5 font-medium">Rental Unit</label>
                    <select className="w-full p-3 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] bg-white focus:ring-2 focus:ring-blue-100" value={formData.rentalUnit} onChange={e => setFormData({...formData, rentalUnit: e.target.value})}>
                      <option value="DAY">Per Day</option>
                      <option value="HOUR">Per Hour</option>
                      <option value="MONTH">Per Month</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] text-[#1a1a1a] mb-1.5 font-medium">Fuel Type</label>
                  <select className="w-full p-3 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] bg-white focus:ring-2 focus:ring-blue-100" value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                    <option value="">None</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="PETROL">Petrol</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[14px] text-[#1a1a1a] mb-1.5 font-medium">Fuel Cost per Litre</label>
                  <input type="number" min="0" className="w-full p-3 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.fuelCostPerLitre} onChange={e => setFormData({...formData, fuelCostPerLitre: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[14px] text-[#1a1a1a] mb-1.5 font-medium">Avg Consumption Per Day</label>
                <input type="number" min="0" className="w-full p-3 border border-[#0f62fe] rounded-xl outline-none text-[#1a1a1a] focus:ring-2 focus:ring-blue-100" value={formData.fuelConsumption} onChange={e => setFormData({...formData, fuelConsumption: e.target.value})} />
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#0f62fe] text-white font-bold rounded-full shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50">
                {isSubmitting ? 'Saving...' : (editId ? 'Update Equipment' : 'Create Equipment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentFormModal;