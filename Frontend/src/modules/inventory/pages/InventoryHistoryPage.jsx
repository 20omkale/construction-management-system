// src/modules/inventory/pages/InventoryHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Mic, Filter, Calendar, MicOff } from 'lucide-react';
import { getMaterialRequestsAPI } from '../services/materialRequest.service';

const InventoryHistoryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const activeTab = location.state?.tab || 'materials';
    
    const [historyData, setHistoryData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [isListening, setIsListening] = useState(false);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'materials') {
                const response = await getMaterialRequestsAPI(1, 50, 'ALL');
                if (response.success) {
                    setHistoryData(response.data);
                    setFilteredData(response.data);
                }
            } else {
                setHistoryData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [activeTab]);

    useEffect(() => {
        let result = historyData;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => 
                item.materialName?.toLowerCase().includes(query) ||
                item.project?.name?.toLowerCase().includes(query) ||
                item.requestNo?.toLowerCase().includes(query)
            );
        }

        if (dateFilter) {
            result = result.filter(item => {
                const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
                return itemDate === dateFilter;
            });
        }

        setFilteredData(result);
    }, [searchQuery, dateFilter, historyData]);

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice search is not supported in this browser. Try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript); 
        };
        
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => setIsListening(false);
        
        recognition.start();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
            case 'COMPLETED':
                return <span className="bg-[#00B69B] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Approved</span>;
            case 'REJECTED':
                return <span className="bg-[#FF4D4F] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Rejected</span>;
            case 'DELIVERED':
                return <span className="bg-[#0066CC] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Transferred</span>;
            default:
                return <span className="bg-orange-400 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
            
            {/* Header */}
            <div>
                <button onClick={() => navigate('/inventory/list')} className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-[#0066CC] transition-colors mb-4">
                    <ArrowLeft size={24} /> Inventory History
                </button>
            </div>

            {/* Main Card Wrapper */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* Search Bar with working Voice Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={isListening ? "Listening..." : "Search Name, Location..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-[14px] outline-none focus:bg-white focus:border-[#0066CC] transition-all ${isListening ? 'ring-2 ring-blue-100' : ''}`}
                    />
                    <button 
                        onClick={handleVoiceSearch}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#0066CC]'}`}
                        title="Search by Voice"
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>

                {/* Toolbar (Date & Filter) */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                        <input 
                            type="date" 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-600 outline-none focus:border-[#0066CC] transition-all cursor-pointer" 
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        <Filter size={14} /> Filter
                    </button>
                </div>

                {/* History List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC]"></div></div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-2xl">
                            No {activeTab} history records found matching your filters.
                        </div>
                    ) : (
                        filteredData.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-[16px] hover:shadow-sm transition-shadow bg-white">
                                <div>
                                    <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">{item.materialName || item.material?.name || 'Equipment Name'}</h4>
                                    <p className="text-[12px] text-gray-400 mb-1">{item.project?.name || 'Global Inventory'}</p>
                                    <p className="text-[12px] font-bold text-[#0066CC]">
                                        {item.status === 'DELIVERED' ? 'Transfer' : 'Request'}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="mb-1.5">
                                        {getStatusBadge(item.status)}
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-400 mb-0.5">
                                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-[11px] font-medium text-gray-400">
                                        Quantity: <span className="font-bold text-[#0066CC]">{item.quantity}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryHistoryPage;