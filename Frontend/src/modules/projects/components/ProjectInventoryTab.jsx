// src/modules/projects/components/ProjectInventoryTab.jsx
import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Filter, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { getProjectInventoryAPI } from '../../inventory/services/inventory.service';
import { createMaterialRequestAPI } from '../../inventory/services/materialRequest.service';
import { MaterialInfoModal, RequestMaterialModal } from './ProjectInventoryModals';

const ProjectInventoryTab = ({ projectId }) => {
    const [activeTab, setActiveTab] = useState('materials');
    
    // Core Data States
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Modal States
    const [selectedItem, setSelectedItem] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // 1. Fetch exactly matching the backend nested response
    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const res = await getProjectInventoryAPI(projectId);
            
            if (res.success && res.data) {
                // The backend returns BOTH { materials: [], equipment: [] }
                // We just pull out the one the user is currently looking at
                const selectedData = activeTab === 'materials' 
                    ? res.data.materials 
                    : res.data.equipment;
                    
                setInventory(selectedData || []);
            }
        } catch (error) {
            console.error("Failed to fetch project inventory", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchInventory();
        setSearchQuery(''); // Reset search when switching tabs
    }, [projectId, activeTab]);

    // 2. Functional Local Search Filtering
    useEffect(() => {
        if (!searchQuery) {
            setFilteredInventory(inventory);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = inventory.filter(item => {
                const name = (item.material?.name || item.name || '').toLowerCase();
                const code = (item.material?.materialCode || item.code || '').toLowerCase();
                return name.includes(query) || code.includes(query);
            });
            setFilteredInventory(filtered);
        }
    }, [searchQuery, inventory]);

    // 3. Functional Voice Search
    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice search is not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => setSearchQuery(e.results[0][0].transcript);
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    // Modal Handlers
    const openInfoModal = (item) => {
        setSelectedItem({
            ...item,
            name: item.material?.name || item.name,
            unit: item.material?.unit || item.unit
        });
        setIsInfoModalOpen(true);
    };

    const handleOpenRequest = () => {
        setIsInfoModalOpen(false);
        setIsRequestModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Toggle Tabs */}
            <div className="flex bg-gray-100/70 p-1.5 rounded-full w-fit mx-auto">
                <button 
                    onClick={() => setActiveTab('materials')}
                    className={`px-16 py-2.5 rounded-full text-[14px] font-bold transition-all ${activeTab === 'materials' ? 'bg-[#0066CC] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Materials
                </button>
                <button 
                    onClick={() => setActiveTab('equipments')}
                    className={`px-16 py-2.5 rounded-full text-[14px] font-bold transition-all ${activeTab === 'equipments' ? 'bg-[#0066CC] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Equipments
                </button>
            </div>

            {/* Functional Search Bar */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder={isListening ? "Listening..." : "Search Name or Code"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 bg-white border border-gray-100 rounded-xl text-[14px] outline-none focus:border-[#0066CC] shadow-sm transition-all ${isListening ? 'ring-2 ring-blue-100' : ''}`}
                />
                <button 
                    onClick={handleVoiceSearch} 
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#0066CC]'}`}
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
            </div>

            {/* Stats Row */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <div>
                    <p className="text-[13px] font-medium text-gray-600 mb-0.5">
                        <span className="font-black text-[#0066CC]">{filteredInventory.length}</span> Total {activeTab === 'materials' ? 'Materials' : 'Equipments'}
                    </p>
                    <p className="text-[13px] font-medium text-gray-600">
                        <span className="font-black text-[#0066CC]">
                            ₹{filteredInventory.reduce((sum, item) => sum + (item.totalValue || item.purchaseCost || 0), 0).toLocaleString()}
                        </span> Total Value
                    </p>
                </div>
                <button className="flex items-center gap-1.5 text-[#0066CC] text-[13px] font-bold hover:underline">
                    <Clock size={16} /> View History
                </button>
            </div>

            {/* Header & Filters */}
            <div className="flex justify-between items-center pt-2">
                <h3 className="text-[15px] font-bold text-gray-900">
                    {activeTab === 'materials' ? 'Materials List' : 'Equipments List'}
                </h3>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter size={14} /> Filter
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Grid List */}
            {isLoading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC]"></div></div>
            ) : filteredInventory.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200 text-sm font-medium">
                    No items found matching your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredInventory.map((item, idx) => (
                        <div 
                            key={item.id || idx} 
                            onClick={() => openInfoModal(item)}
                            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#8AB4F8] transition-all cursor-pointer relative"
                        >
                            {/* Low Stock Alert */}
                            {activeTab === 'materials' && (item.quantityAvailable <= (item.material?.minimumStock || 0)) && (
                                <AlertTriangle size={18} className="absolute top-5 right-5 text-red-500" />
                            )}

                            {activeTab === 'equipments' && (
                                <span className="absolute top-5 right-5 bg-[#0066CC] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                    {item.ownershipType || 'OWNED'}
                                </span>
                            )}

                            <h4 className="text-[15px] font-bold text-gray-900 leading-none pr-8">
                                {item.material?.name || item.name || 'Unknown Item'}
                            </h4>
                            <p className="text-[11px] text-gray-400 font-medium mt-1 mb-4 uppercase tracking-wider">
                                {item.material?.materialCode || item.code || 'M-CODE-00'}
                            </p>
                            
                            {activeTab === 'materials' ? (
                                <div className="space-y-0.5">
                                    <p className="text-[12px] text-gray-600 font-medium">
                                        Total: <span className="font-bold text-[#0066CC]">{item.quantityTotal || 0}</span> {item.material?.unit}
                                    </p>
                                    <p className="text-[12px] text-gray-600 font-medium">
                                        Remaining: <span className="font-bold text-[#0066CC]">{item.quantityAvailable || 0}</span> {item.material?.unit}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    <p className="text-[12px] text-gray-600 font-medium">
                                        Status: <span className="font-bold text-[#0066CC]">{item.status || 'AVAILABLE'}</span>
                                    </p>
                                    <p className="text-[12px] text-gray-600 font-medium">
                                        Type: <span className="font-bold text-gray-900">{item.type || 'Machinery'}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <MaterialInfoModal 
                isOpen={isInfoModalOpen} 
                onClose={() => setIsInfoModalOpen(false)} 
                material={selectedItem} 
                onRequestClick={handleOpenRequest}
            />
            
            <RequestMaterialModal 
                isOpen={isRequestModalOpen} 
                onClose={() => setIsRequestModalOpen(false)} 
                material={selectedItem}
                projectId={projectId}
                onSubmit={async (data) => {
                    await createMaterialRequestAPI(data);
                    alert("Material request submitted successfully!");
                    fetchInventory(); // Refresh list after successful request
                }}
            />
        </div>
    );
};

export default ProjectInventoryTab;