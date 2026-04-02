// src/modules/inventory/pages/InventoryListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { inventoryService } from '../services/inventory.service';
import PageContainer from '../../../shared/components/PageContainer';
import MaterialFormModal from '../components/MaterialFormModal';
import EquipmentFormModal from '../components/EquipmentFormModal';

const InventoryListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'materials';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [summary, setSummary] = useState({ materialCount: 0, materialValue: 0, equipmentCount: 0, equipmentValue: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isMatModalOpen, setIsMatModalOpen] = useState(false);
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [matRes, eqRes] = await Promise.all([
        inventoryService.getAllMaterials(),
        inventoryService.getAllEquipment()
      ]);
      
      if (matRes.success) {
        const mats = matRes.data || [];
        setMaterials(mats);
        const matValue = mats.reduce((sum, m) => sum + ((m.stockQuantity || 0) * (m.unitPrice || 0)), 0);
        setSummary(prev => ({ ...prev, materialCount: mats.length, materialValue: matValue }));
      }
      
      if (eqRes.success) {
        const eqs = eqRes.data || [];
        setEquipment(eqs);
        const eqValue = eqRes.summary?.totalValue || eqs.reduce((sum, e) => sum + (e.purchaseCost || 0), 0);
        setSummary(prev => ({ ...prev, equipmentCount: eqRes.summary?.totalEquipment || eqs.length, equipmentValue: eqValue }));
      }
    } catch (error) { 
      console.error("Failed to fetch inventory data:", error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []); 

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const openCreateModal = () => {
    activeTab === 'materials' ? setIsMatModalOpen(true) : setIsEqModalOpen(true);
  };

  const filteredMaterials = materials.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.materialCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredEquipment = equipment.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300 min-h-[75vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 shrink-0">
          <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-white hover:text-[#0f62fe] transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Global Inventory</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6 ml-10 shrink-0">Company-wide master inventory records</p>

        {/* Tabs */}
        <div className="flex bg-[#f0f4f8] dark:bg-gray-900 p-1.5 rounded-full w-full md:max-w-md mb-6 ml-0 md:ml-10 shrink-0">
          <button className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${activeTab === 'materials' ? 'bg-[#0f62fe] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`} onClick={() => handleTabChange('materials')}>Materials</button>
          <button className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${activeTab === 'equipments' ? 'bg-[#0f62fe] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`} onClick={() => handleTabChange('equipments')}>Equipments</button>
        </div>

        {/* Search */}
        <div className="relative w-full border-b border-gray-100 dark:border-gray-700 pb-6 mb-6 shrink-0">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input type="text" className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-gray-900 dark:text-white font-medium" placeholder="Search by Name or Code" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Totals & History */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 shrink-0">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium"><span className="font-black text-[#0f62fe] text-lg">{activeTab === 'materials' ? summary.materialCount : summary.equipmentCount}</span> Total {activeTab === 'materials' ? 'Materials' : 'Equipments'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium"><span className="font-black text-[#0f62fe] text-lg">₹{(activeTab === 'materials' ? summary.materialValue : summary.equipmentValue).toLocaleString()}</span> Total Value</p>
          </div>
          <button onClick={() => navigate(`/inventory/history?tab=${activeTab}`)} className="text-sm font-bold text-[#0f62fe] flex items-center gap-1 hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> View History
          </button>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{activeTab === 'materials' ? 'Materials List' : 'Equipments List'}</h3>
          <div className="flex gap-2">
            <button onClick={openCreateModal} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#0f62fe] text-white font-bold text-sm rounded-xl shadow-md hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg> Create {activeTab === 'materials' ? 'Material' : 'Equipment'}
            </button>
          </div>
        </div>

        {/* Grid List (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 md:pb-0">
          {isLoading ? (
            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f62fe]"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {activeTab === 'materials' ? (
                filteredMaterials.length > 0 ? filteredMaterials.map((mat) => (
                  <div key={mat.id} onClick={() => navigate(`/inventory/material/${mat.id}`)} className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-[#0f62fe] hover:shadow-md transition-all bg-white dark:bg-gray-800 group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black px-2 py-1 rounded bg-blue-50 text-[#0f62fe] uppercase tracking-wider">{mat.category || 'General'}</span>
                      <span className="text-xs text-gray-400 font-bold">{mat.materialCode || 'N/A'}</span>
                    </div>
                    <h4 className="font-black text-lg text-gray-900 dark:text-white group-hover:text-[#0f62fe] transition-colors mb-4">{mat.name}</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Stock</span><span className={`font-bold ${mat.stockQuantity <= (mat.minimumStock || 0) ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{mat.stockQuantity || 0} {mat.unit}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Unit Price</span><span className="font-bold text-gray-900 dark:text-white">₹{mat.unitPrice || 0}</span></div>
                    </div>
                  </div>
                )) : <div className="col-span-full text-center py-10 text-gray-500 font-bold bg-gray-50 dark:bg-gray-900 rounded-2xl">No materials found.</div>
              ) : (
                filteredEquipment.length > 0 ? filteredEquipment.map((eq) => (
                  <div key={eq.id} onClick={() => navigate(`/inventory/equipment/${eq.id}`)} className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-[#0f62fe] hover:shadow-md transition-all bg-white dark:bg-gray-800 group">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${eq.ownershipType === 'OWNED' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>{eq.ownershipType}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${eq.status === 'AVAILABLE' ? 'bg-blue-50 text-[#0f62fe]' : 'bg-orange-50 text-orange-600'}`}>{eq.status || 'AVAILABLE'}</span>
                    </div>
                    <h4 className="font-black text-lg text-gray-900 dark:text-white group-hover:text-[#0f62fe] transition-colors mb-1">{eq.name}</h4>
                    <p className="text-xs text-gray-400 font-bold mb-4">{eq.type}</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Cost/Rate</span><span className="font-bold text-gray-900 dark:text-white">₹{eq.ownershipType === 'OWNED' ? eq.purchaseCost : eq.rentalRate}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500 font-medium">Location</span><span className="font-bold text-gray-900 dark:text-white">{eq.location === 'PROJECT' ? 'On Site' : 'Global Warehouse'}</span></div>
                    </div>
                  </div>
                )) : <div className="col-span-full text-center py-10 text-gray-500 font-bold bg-gray-50 dark:bg-gray-900 rounded-2xl">No equipment found.</div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Floating Mobile Create Button */}
      <button onClick={openCreateModal} className="md:hidden fixed bottom-8 right-6 w-14 h-14 bg-[#0f62fe] text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
      </button>

      {/* Render Modals */}
      <MaterialFormModal isOpen={isMatModalOpen} onClose={() => setIsMatModalOpen(false)} onSuccess={fetchData} />
      <EquipmentFormModal isOpen={isEqModalOpen} onClose={() => setIsEqModalOpen(false)} onSuccess={fetchData} />
      
    </PageContainer>
  );
};

export default InventoryListPage;