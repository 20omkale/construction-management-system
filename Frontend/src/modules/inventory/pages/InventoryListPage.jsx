// src/modules/inventory/pages/InventoryListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Clock, Plus, Filter, Trash2, AlertTriangle, Mic, MicOff } from 'lucide-react';
import { getMaterialsAPI, getEquipmentsAPI, createMaterialAPI, createEquipmentAPI } from '../services/inventory.service';
import MaterialFormModal from '../components/MaterialFormModal';
import EquipmentFormModal from '../components/EquipmentFormModal';

const InventoryListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('materials'); 
    
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterStock, setFilterStock] = useState('ALL'); 
    
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);

    // Sync tab with URL on load or back navigation
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && (tab === 'materials' || tab === 'equipments')) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'materials') {
                const res = await getMaterialsAPI();
                if (res.success) setItems(res.data);
            } else {
                const res = await getEquipmentsAPI();
                if (res.success) setItems(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        setFilterCategory('ALL');
        setFilterStock('ALL');
        setSearchQuery('');
    }, [activeTab]);

    useEffect(() => {
        let result = items;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item => item.name?.toLowerCase().includes(q) || item.materialCode?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q));
        }
        if (filterCategory !== 'ALL') result = result.filter(item => item.category === filterCategory);
        if (activeTab === 'materials' && filterStock !== 'ALL') {
            if (filterStock === 'LOW') result = result.filter(item => item.stockQuantity > 0 && item.stockQuantity <= item.minimumStock);
            else if (filterStock === 'OUT') result = result.filter(item => item.stockQuantity === 0);
        }
        setFilteredItems(result);
    }, [searchQuery, filterCategory, filterStock, items]);

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Voice search is not supported in this browser.");
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => setSearchQuery(e.results[0][0].transcript);
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const totalUsage = filteredItems.reduce((sum, item) => sum + (parseFloat(item.stockQuantity || item.purchaseCost || 0)), 0);

    return (
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
            <div>
                <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-[#0066CC] transition-colors mb-1">
                    <ArrowLeft size={24} /> Inventory
                </button>
                <p className="text-gray-400 text-sm font-medium ml-8">Global inventory across all projects</p>
            </div>

            <div className="ml-8 flex bg-gray-100/70 p-1.5 rounded-full w-fit">
                <button 
                    onClick={() => {
                        setActiveTab('materials');
                        navigate('/inventory/list?tab=materials', { replace: true });
                    }} 
                    className={`px-12 py-2.5 rounded-full text-[14px] font-bold transition-all ${activeTab === 'materials' ? 'bg-[#0066CC] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Materials
                </button>
                <button 
                    onClick={() => {
                        setActiveTab('equipments');
                        navigate('/inventory/list?tab=equipments', { replace: true });
                    }} 
                    className={`px-12 py-2.5 rounded-full text-[14px] font-bold transition-all ${activeTab === 'equipments' ? 'bg-[#0066CC] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Equipments
                </button>
            </div>

            <div className="ml-8 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder={isListening ? "Listening..." : "Search Name, Code, Category..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3.5 bg-white border border-gray-100 rounded-2xl text-[14px] outline-none focus:border-[#0066CC] transition-all shadow-sm ${isListening ? 'ring-2 ring-blue-100' : ''}`}
                />
                <button onClick={handleVoiceSearch} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#0066CC]'}`}>
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
            </div>

            <div className="ml-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                    <p className="text-[13px] font-medium text-gray-600 mb-1"><span className="font-black text-[#0066CC]">{filteredItems.length}</span> Total {activeTab === 'materials' ? 'Materials' : 'Equipments'}</p>
                    <p className="text-[13px] font-medium text-gray-600"><span className="font-black text-[#0066CC]">₹{totalUsage.toLocaleString()}</span> Total Usage Value</p>
                </div>
                <button onClick={() => navigate('/inventory/history', { state: { tab: activeTab } })} className="flex items-center gap-1.5 text-[#0066CC] text-[13px] font-bold hover:underline">
                    <Clock size={16} /> View History
                </button>
            </div>

            <div className="ml-8 flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                <h3 className="text-[16px] font-bold text-gray-900">{activeTab === 'materials' ? 'Materials List' : 'Equipments List'}</h3>
                
                <div className="flex items-center gap-3">
                    <button onClick={() => activeTab === 'materials' ? setIsMaterialModalOpen(true) : setIsEquipmentModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#0066CC] text-white text-[13px] font-bold rounded-xl shadow-md hover:bg-[#0052a3] transition-colors">
                        <Plus size={16} /> Create New
                    </button>
                    
                    <div className="relative">
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-[13px] font-bold transition-colors ${isFilterOpen || filterCategory !== 'ALL' || filterStock !== 'ALL' ? 'bg-blue-50 border-[#0066CC] text-[#0066CC]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                            <Filter size={16} /> Filter
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 top-12 w-64 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:border-[#0066CC]">
                                            <option value="ALL">All Categories</option>
                                            {activeTab === 'materials' ? (
                                                <><option value="Raw Material">Raw Material</option><option value="Consumables">Consumables</option></>
                                            ) : (
                                                <><option value="Heavy Machinery">Heavy Machinery</option><option value="Vehicles">Vehicles</option></>
                                            )}
                                        </select>
                                    </div>

                                    {activeTab === 'materials' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Stock Status</label>
                                            <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:border-[#0066CC]">
                                                <option value="ALL">All Status</option>
                                                <option value="LOW">Low Stock</option>
                                                <option value="OUT">Out of Stock</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="pt-2 flex justify-end">
                                        <button onClick={() => { setFilterCategory('ALL'); setFilterStock('ALL'); setIsFilterOpen(false); }} className="text-xs font-bold text-red-500 hover:underline">Clear Filters</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="ml-8">
                {isLoading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC]"></div></div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center"><p className="text-gray-500 text-sm font-medium">No items match your search or filters.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredItems.map((item, idx) => (
                            <div key={item.id || idx} className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm relative hover:shadow-md transition-shadow">
                                {activeTab === 'materials' ? (
                                    <>
                                        {(item.stockQuantity <= item.minimumStock || item.isBelowMinimum) && <AlertTriangle size={20} className="absolute top-6 right-6 text-red-500" />}
                                        <h4 className="text-[16px] font-bold text-gray-900 leading-none">{item.name}</h4>
                                        <p className="text-[12px] text-gray-400 font-medium mt-1 mb-5">{item.materialCode || 'M-CODE-00'}</p>
                                        <div className="space-y-1">
                                            <p className="text-[13px] text-gray-600 font-medium">Total: <span className="font-black text-[#0066CC]">{item.stockQuantity || 0}</span> {item.unit}</p>
                                            <p className="text-[13px] text-gray-600 font-medium">Remaining: <span className="font-black text-[#0066CC]">{item.stockQuantity || 0}</span> {item.unit}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="absolute top-6 right-6 bg-[#0066CC] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded">{item.type === 'OWNED' ? 'Owned' : 'Rented'}</span>
                                        <h4 className="text-[16px] font-bold text-gray-900 leading-none">{item.name}</h4>
                                        <p className="text-[12px] text-gray-400 font-medium mt-1 mb-5">{item.category || 'EQ-CODE-00'}</p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <MaterialFormModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} onSubmit={async (data) => { await createMaterialAPI(data); fetchItems(); }} />
            <EquipmentFormModal isOpen={isEquipmentModalOpen} onClose={() => setIsEquipmentModalOpen(false)} onSubmit={async (data) => { await createEquipmentAPI(data); fetchItems(); }} />
        </div>
    );
};

export default InventoryListPage;