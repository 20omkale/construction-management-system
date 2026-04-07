import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Search, Filter, Trash2, Clock, Package, AlertCircle, 
  RefreshCw, X, ArrowLeft, AlertTriangle, Loader2 
} from 'lucide-react';
import api from '../../../shared/utils/api';

const ProjectInventoryTab = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('Materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // --- MODAL STATES ---
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // --- UI INTERACTION STATES ---
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [itemFilter, setItemFilter] = useState(''); 
  const filterRef = useRef(null);

  // --- DATA STATES ---
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [equipments, setEquipments] = useState([]);

  // --- REAL-TIME DATA FETCHING ---
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [statsRes, activitiesRes, itemsRes] = await Promise.all([
        api.get(`/inventory/project/${projectId}/stats`),
        api.get(`/inventory/project/${projectId}/activity`),
        api.get(`/inventory/project/${projectId}/items`)
      ]);

      setStats(statsRes.data?.data || statsRes.data);
      setActivities(activitiesRes.data?.data || []);
      setMaterials(itemsRes.data?.data?.materials || itemsRes.data?.materials || []);
      setEquipments(itemsRes.data?.data?.equipments || itemsRes.data?.equipments || []);
    } catch (error) {
      console.error("API Error - using fallback data:", error);
      // fallback to figma data if API isn't ready
      setStats({
        equipmentValue: 3035000,
        materialValue: 1840000,
        totalInventory: 4875000,
        budget: { total: 20000000, used: 12000000, remaining: 8000000 }
      });
      setMaterials([
        { id: 'B-OPC-01', name: 'Cement', total: 120, remaining: 80, hasAlert: false, unit: 'kg', costPerUnit: 400, used: 40, threshold: 20 },
        { id: 'B-OPC-02', name: 'Steel S-12', total: 500, remaining: 450, hasAlert: false, unit: 'kg', costPerUnit: 65, used: 50, threshold: 100 },
        { id: 'B-OPC-03', name: 'Fine Sand', total: 100, remaining: 10, hasAlert: true, unit: 'tons', costPerUnit: 1200, used: 90, threshold: 20 }
      ]);
      setEquipments([
        { id: 'EQ-JCB-001', name: 'JCB Excavator', status: 'In use', ownership: 'Owned', totalQuantity: 12, damaged: 0, used: 6, remaining: 6 },
        { id: 'EQ-JCB-002', name: 'Tower Crane', status: 'Available', ownership: 'Rented', totalQuantity: 1, damaged: 0, used: 0, remaining: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [projectId]);

  // Click Outside logic for Filter
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return itemFilter === 'Low Stock' ? m.hasAlert && matchesSearch : matchesSearch;
  });

  const filteredEquipments = equipments.filter(eq => {
    const matchesSearch = eq.name?.toLowerCase().includes(searchQuery.toLowerCase()) || eq.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return itemFilter ? eq.status === itemFilter && matchesSearch : matchesSearch;
  });

  if (loading && !stats) {
    return (
      <div className="py-40 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Project Inventory...</p>
      </div>
    );
  }

  // Dashboard Calculation
  const equipPercent = Math.round((stats.equipmentValue / stats.totalInventory) * 100) || 62;
  const matPercent = Math.round((stats.materialValue / stats.totalInventory) * 100) || 38;
  const budgetUsedPercent = Math.round((stats.budget.used / stats.budget.total) * 100) || 60;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* ============================================================
          1. TOP DASHBOARD (Charts & Budget)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Donut Chart Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex items-center justify-center gap-12">
            <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="3.5"></circle>
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#00C4CC" strokeWidth="4" strokeDasharray={`${equipPercent} ${100 - equipPercent}`} strokeLinecap="round"></circle>
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#0066CC" strokeWidth="4" strokeDasharray={`${matPercent} ${100 - matPercent}`} strokeDashoffset={`-${equipPercent}`} strokeLinecap="round"></circle>
                </svg>
            </div>
            
            <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#00C4CC]"></div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Equipment:</span>
                    </div>
                    <span className="text-sm font-black text-[#00C4CC]">₹{stats.equipmentValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#0066CC]"></div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Material:</span>
                    </div>
                    <span className="text-sm font-black text-[#0066CC]">₹{stats.materialValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Total Inventory:</span>
                    <span className="text-base font-black text-slate-800">₹{stats.totalInventory.toLocaleString()}</span>
                </div>
            </div>
        </div>

        {/* Budget Bar Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex flex-col justify-center">
            <h3 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-wider">Project Budget</h3>
            
            <div className="w-full h-6 bg-blue-50 rounded-full overflow-hidden mb-6 border border-blue-100">
                <div className="h-full bg-[#0066CC] rounded-r-full shadow-inner" style={{ width: `${budgetUsedPercent}%` }}></div>
            </div>
            
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Contract: <span className="text-slate-800 ml-1">₹{stats.budget.total.toLocaleString()}</span></p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Used Amount: <span className="text-slate-800 ml-1">₹{stats.budget.used.toLocaleString()}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-[#0066CC] uppercase mb-1">{budgetUsedPercent}% Consumed</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Remaining: <span className="text-emerald-500 ml-1">₹{stats.budget.remaining.toLocaleString()}</span></p>
                </div>
            </div>
        </div>
      </div>

      {/* ============================================================
          2. RECENT ACTIVITY SECTION
          ============================================================ */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Recent Activity</h3>
            <button onClick={() => setIsHistoryModalOpen(true)} className="text-[10px] font-black text-[#0066CC] uppercase tracking-widest hover:underline flex items-center gap-2">
                View Transaction Log <ArrowLeft className="w-3 h-3 rotate-180" />
            </button>
        </div>
        
        <div className="space-y-5">
            {activities.length > 0 ? activities.slice(0, 3).map((act) => (
                <div key={act.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-500 shadow-sm`}>
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{act.title || act.description || 'Inventory Update'}</p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Reference ID: {act.id.slice(0,12)}</p>
                        </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">2 hours ago</span>
                </div>
            )) : (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No recent activity recorded</p>
              </div>
            )}
        </div>
      </div>

      {/* ============================================================
          3. MAIN LIST SECTION (MATERIALS / EQUIPMENTS)
          ============================================================ */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
          
          {/* Segmented Control */}
          <div className="flex justify-center mb-10">
              <div className="flex bg-[#F1F5F9] p-1.5 rounded-full shadow-inner">
                  <button 
                    onClick={() => { setActiveTab('Materials'); setItemFilter(''); }}
                    className={`px-16 py-3 rounded-full text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'Materials' ? 'bg-[#0066CC] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      Materials
                  </button>
                  <button 
                    onClick={() => { setActiveTab('Equipments'); setItemFilter(''); }}
                    className={`px-16 py-3 rounded-full text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'Equipments' ? 'bg-[#0066CC] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                      Equipments
                  </button>
              </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-10">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                  type="text" 
                  placeholder={`Search ${activeTab} by name or code...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold text-slate-600 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              />
          </div>

          {/* Stats Bar */}
          <div className="flex justify-between items-center mb-10 bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
              <div className="flex gap-10">
                  <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Count</p>
                      <p className="text-lg font-black text-slate-800">{activeTab === 'Equipments' ? filteredEquipments.length : filteredMaterials.length} Items</p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Value</p>
                      <p className="text-lg font-black text-[#0066CC]">₹{(activeTab === 'Equipments' ? stats.equipmentValue : stats.materialValue).toLocaleString()}</p>
                  </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-200 rounded-2xl text-[11px] font-black text-[#0066CC] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  <Clock className="w-4 h-4" /> View History
              </button>
          </div>

          {/* Action Header */}
          <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                {activeTab} Inventory List 
                {itemFilter && <span className="ml-3 text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Filter: {itemFilter}</span>}
              </h3>
              <div className="flex items-center gap-3">
                  
                  {/* Filter Dropdown */}
                  <div className="relative" ref={filterRef}>
                      <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)} 
                        className={`flex items-center gap-2 px-5 py-2.5 border rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${itemFilter || isFilterOpen ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                          <Filter className="w-4 h-4" /> Filter
                      </button>

                      {isFilterOpen && (
                          <div className="absolute top-full mt-3 right-0 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-50 p-3 animate-in slide-in-from-top-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3 mt-2 text-center">Filter {activeTab}</p>
                              <button onClick={() => { setItemFilter(''); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl mb-1 transition-colors ${itemFilter === '' ? 'bg-blue-50 text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>All Items</button>
                              
                              {activeTab === 'Materials' ? (
                                  <button onClick={() => { setItemFilter('Low Stock'); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl mb-1 transition-colors ${itemFilter === 'Low Stock' ? 'bg-blue-50 text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>Low Stock Only</button>
                              ) : (
                                  <>
                                      <button onClick={() => { setItemFilter('In use'); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl mb-1 ${itemFilter === 'In use' ? 'bg-blue-50 text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>In Use</button>
                                      <button onClick={() => { setItemFilter('Available'); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl ${itemFilter === 'Available' ? 'bg-blue-50 text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>Available</button>
                                  </>
                              )}
                          </div>
                      )}
                  </div>

                  {/* Delete Toggle */}
                  <button 
                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                    className={`p-3 border rounded-2xl transition-all ${isDeleteMode ? 'border-red-500 bg-red-500 text-white shadow-lg' : 'border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}
                  >
                      {isDeleteMode ? <X className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                  </button>
              </div>
          </div>

          {/* --- CARDS GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeTab === 'Equipments' ? (
                  filteredEquipments.map((eq, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => { if(!isDeleteMode){setSelectedItem(eq); setIsDetailModalOpen(true);}}} 
                        className={`border border-slate-100 rounded-[2rem] p-6 flex flex-col justify-between transition-all bg-white shadow-sm ${!isDeleteMode ? 'hover:border-blue-300 hover:shadow-md cursor-pointer group' : 'opacity-80'}`}
                      >
                          <div className="flex justify-between items-start mb-6">
                              <div className="space-y-1">
                                  <h4 className={`text-base font-black text-slate-800 ${!isDeleteMode && 'group-hover:text-[#0066CC]'} transition-colors line-clamp-1`}>{eq.name}</h4>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{eq.id}</p>
                              </div>
                              <span className={`${eq.status === 'Available' || eq.status === 'AVAILABLE' ? 'bg-[#00A86B]' : 'bg-[#0066CC]'} text-white text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm`}>{eq.status}</span>
                          </div>
                          
                          <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                              <p className="text-[11px] font-black text-[#0066CC] uppercase tracking-widest">{eq.ownership || 'Company Owned'}</p>
                              {isDeleteMode && (
                                  <button onClick={(e) => handleDeleteRow(e, eq.id, 'Equipment')} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all animate-in zoom-in">
                                      <Trash2 className="w-5 h-5" />
                                  </button>
                              )}
                          </div>
                      </div>
                  ))
              ) : (
                  filteredMaterials.map((mat, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => { if(!isDeleteMode){setSelectedItem(mat); setIsDetailModalOpen(true);}}} 
                        className={`border border-slate-100 rounded-[2rem] p-7 transition-all bg-white shadow-sm ${!isDeleteMode ? 'hover:border-blue-300 hover:shadow-md cursor-pointer group' : 'opacity-80'}`}
                      >
                          <div className="flex justify-between items-start mb-8">
                              <div className="space-y-1">
                                  <h4 className={`text-base font-black text-slate-800 ${!isDeleteMode && 'group-hover:text-[#0066CC]'} transition-colors`}>{mat.name}</h4>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mat.id}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                  {mat.hasAlert && <div className="bg-red-50 p-2 rounded-full animate-pulse"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
                                  {isDeleteMode && (
                                      <button onClick={(e) => handleDeleteRow(e, mat.id, 'Material')} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all animate-in zoom-in">
                                          <Trash2 className="w-5 h-5" />
                                      </button>
                                  )}
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase">Total Stock</p>
                                  <p className="text-sm font-black text-slate-800">{mat.total} {mat.unit}</p>
                              </div>
                              <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase">Available</p>
                                  <p className={`text-sm font-black ${mat.hasAlert ? 'text-red-500' : 'text-[#0066CC]'}`}>{mat.remaining} {mat.unit}</p>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>

      {/* ============================================================
          4. ITEM DETAILS MODAL (Popups)
          ============================================================ */}
      {isDetailModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                  
                  {/* Modal Header */}
                  <div className="px-10 py-8 flex justify-between items-center border-b border-slate-50 bg-slate-50/30">
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedItem.name}</h2>
                        <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">{selectedItem.id}</p>
                      </div>
                      <button onClick={() => setIsDetailModalOpen(false)} className="p-2.5 bg-white text-slate-400 border border-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="p-10 space-y-10">
                      <div className="space-y-6">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Resource Specification</h3>
                        
                        <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Resource Name</p>
                              <p className="text-sm font-black text-slate-800">{selectedItem.name}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Unit Type</p>
                              <p className="text-sm font-black text-slate-800">{selectedItem.unit || 'Standard'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Unit Valuation</p>
                              <p className="text-sm font-black text-emerald-500">₹{selectedItem.costPerUnit || selectedItem.unitPrice || '400'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Current Capacity</p>
                              <p className="text-sm font-black text-slate-800">{selectedItem.total || selectedItem.totalQuantity || 0} Units</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Allocated / Used</p>
                              <p className="text-sm font-black text-blue-500">{selectedItem.used || 0} Units</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Available Buffer</p>
                              <p className={`text-sm font-black ${selectedItem.hasAlert ? 'text-red-500' : 'text-slate-800'}`}>{selectedItem.remaining || 0} Units</p>
                            </div>
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="flex gap-5 pt-8 border-t border-slate-50">
                          <button 
                            onClick={() => { setIsDetailModalOpen(false); setIsRequestModalOpen(true); }}
                            className="flex-1 bg-[#00A86B] text-white py-4 rounded-[1.25rem] text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                          >
                              Request Stock
                          </button>
                          <button 
                            onClick={() => { setIsDetailModalOpen(false); setIsTransferModalOpen(true); }}
                            className="flex-1 bg-[#0066CC] text-white py-4 rounded-[1.25rem] text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                          >
                              Resource Transfer
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ============================================================
          5. REQUEST STOCK MODAL
          ============================================================ */}
      {isRequestModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
                  <div className="px-8 py-6 flex items-center gap-5 border-b border-slate-50 bg-slate-50/50">
                      <button onClick={() => { setIsRequestModalOpen(false); setIsDetailModalOpen(true); }} className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-100 transition-all shadow-sm border border-slate-100">
                          <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">Request Material</h2>
                  </div>
                  <div className="p-10 space-y-8">
                      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Targeting Item</p>
                        <p className="text-sm font-black text-blue-700">{selectedItem?.name} ({selectedItem?.id})</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Quantity Required</label>
                            <input type="number" placeholder={`Amount in ${selectedItem?.unit || 'units'}`} className="w-full px-6 py-4 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 transition-all" />
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Needed By Date</label>
                            <input type="date" className="w-full px-6 py-4 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 transition-all" />
                        </div>
                      </div>

                      <button onClick={() => { alert('Success: Request sent to procurement.'); setIsRequestModalOpen(false); }} className="w-full bg-[#00A86B] text-white py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-50 hover:bg-emerald-600 transition-all">Submit Procurement Request</button>
                  </div>
              </div>
          </div>
      )}

      {/* ============================================================
          6. TRANSFER MODAL
          ============================================================ */}
      {isTransferModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
                  <div className="px-8 py-6 flex items-center gap-5 border-b border-slate-50 bg-slate-50/50">
                      <button onClick={() => { setIsTransferModalOpen(false); setIsDetailModalOpen(true); }} className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-100 transition-all shadow-sm border border-slate-100">
                          <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">Transfer Resource</h2>
                  </div>
                  <div className="p-10 space-y-8">
                      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Transferring Item</p>
                        <p className="text-sm font-black text-blue-700">{selectedItem?.name} ({selectedItem?.id})</p>
                      </div>

                      <div className="space-y-6">
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Destination Project</label>
                            <select className="w-full px-6 py-4 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 transition-all">
                                <option>Select Destination Site...</option>
                                <option>Site B - Reliance Building</option>
                                <option>Site C - Warehouse Alpha</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Quantity to Move</label>
                            <input type="number" placeholder={`Max available: ${selectedItem?.remaining}`} className="w-full px-6 py-4 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 transition-all" />
                        </div>
                      </div>

                      <button onClick={() => { alert('Success: Transfer initiated.'); setIsTransferModalOpen(false); }} className="w-full bg-[#0066CC] text-white py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-50 hover:bg-blue-800 transition-all">Initiate Field Transfer</button>
                  </div>
              </div>
          </div>
      )}

      {/* ============================================================
          7. TRANSACTION HISTORY MODAL
          ============================================================ */}
      {isHistoryModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
              <div className="bg-white w-full max-w-2xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300 overflow-hidden">
                  <div className="px-10 py-8 flex justify-between items-center border-b border-slate-50 bg-slate-50/30 shrink-0">
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Inventory Transaction Log</h2>
                        <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Full Audit History</p>
                      </div>
                      <button onClick={() => setIsHistoryModalOpen(false)} className="p-2.5 bg-white text-slate-400 border border-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
                      {activities.length > 0 ? [...activities, ...activities].map((act, idx) => (
                          <div key={idx} className="flex items-start gap-6 group">
                              <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                                  <Package className="w-7 h-7" />
                              </div>
                              <div className="flex-1 border-b border-slate-50 pb-8 group-last:border-0">
                                  <div className="flex justify-between items-start">
                                      <p className="text-base font-black text-slate-800">{act.title || act.description || 'Stock Movement'}</p>
                                      <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">2h ago</span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-500 mt-2 leading-relaxed">
                                    The following transaction was recorded automatically during DPR entry for project {projectId.slice(0,8)}.
                                  </p>
                                  <div className="flex gap-5 mt-4">
                                    <p className="text-[10px] font-black text-[#0066CC] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Log: #{act.id.slice(0,10)}</p>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Verified</p>
                                  </div>
                              </div>
                          </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                           <Package className="w-20 h-20" />
                           <p className="text-sm font-black uppercase tracking-widest">No log entries found</p>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ProjectInventoryTab;