// src/modules/inventory/pages/PurchaseOrderListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Filter, Calendar, FileText, AlertCircle, Mic, MicOff } from 'lucide-react';
import { getAllPurchaseOrdersAPI, createPurchaseOrderAPI, createGRNAPI } from '../services/inventory.service';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import GRNModal from '../components/GRNModal';

const PurchaseOrderListPage = () => {
    const navigate = useNavigate();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Voice Search & Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Filter State
    const [filterStatus, setFilterStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    // Modals
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
    const [selectedPOId, setSelectedPOId] = useState(null);

    const fetchPOs = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await getAllPurchaseOrdersAPI({
                page: 1, limit: 20, search: searchQuery, status: filterStatus, fromDate, toDate
            }); 
            if (response.success) setPurchaseOrders(response.data);
            else setError(response.message);
        } catch (err) {
            setError(err.message || "Network Error.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPOs(); }, [filterStatus, fromDate, toDate]);

    const handleSearchSubmit = (e) => { if (e.key === 'Enter') fetchPOs(); };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Voice search is not supported in this browser.");
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            setSearchQuery(e.results[0][0].transcript);
            fetchPOs(); // Trigger search automatically after voice input
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const clearFilters = () => {
        setFilterStatus(''); setFromDate(''); setToDate(''); setSearchQuery(''); setIsFilterOpen(false); fetchPOs();
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
            <div>
                <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-[#0066CC] transition-colors mb-2">
                    <ArrowLeft size={24} /> Purchase Orders
                </button>
            </div>

            {error && <div className="ml-8 bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-start gap-3"><AlertCircle size={20} className="shrink-0 mt-0.5" /><div><p className="font-bold text-sm">Internal Server Error</p><p className="text-xs mt-1">{error}</p></div></div>}

            <div className="ml-8 bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="relative w-full lg:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={isListening ? "Listening..." : "Search PO Number or Supplier..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchSubmit}
                        className={`w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-xl text-[14px] outline-none focus:bg-white focus:border-[#0066CC] transition-all ${isListening ? 'ring-2 ring-blue-100' : ''}`}
                    />
                    <button onClick={handleVoiceSearch} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#0066CC]'}`}>
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Functional Filter Dropdown */}
                    <div className="relative">
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-5 py-3 border rounded-xl text-[14px] font-bold transition-colors ${filterStatus || fromDate || toDate ? 'bg-blue-50 border-[#0066CC] text-[#0066CC]' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}>
                            <Filter size={18} /> Filters {(filterStatus || fromDate || toDate) && <span className="w-2 h-2 rounded-full bg-[#0066CC]"></span>}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 top-14 w-72 bg-white border border-gray-100 shadow-xl rounded-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:border-[#0066CC]">
                                        <option value="">All Statuses</option>
                                        <option value="DRAFT">Draft</option>
                                        <option value="PENDING_APPROVAL">Pending Approval</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="ORDERED">Ordered</option>
                                        <option value="RECEIVED">Received</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">From</label>
                                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:border-[#0066CC] text-gray-600" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">To</label>
                                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:border-[#0066CC] text-gray-600" />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-between items-center border-t border-gray-100 mt-4">
                                    <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:underline">Reset</button>
                                    <button onClick={() => setIsFilterOpen(false)} className="px-4 py-2 bg-[#0066CC] text-white text-xs font-bold rounded-lg hover:bg-[#0052a3]">Apply</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsPOModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-[#0066CC] text-white text-[14px] font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0052a3] transition-all">
                        <Plus size={18} /> Create PO
                    </button>
                </div>
            </div>

            <div className="ml-8">
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066CC]"></div></div>
                ) : purchaseOrders.length === 0 ? (
                    <div className="bg-white py-20 rounded-[24px] border border-gray-100 shadow-sm text-center"><FileText size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-[18px] font-bold text-gray-900 mb-2">No Purchase Orders</h3><p className="text-[14px] text-gray-500">No purchase orders found matching your filters.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {purchaseOrders.map((po) => (
                            <div key={po.id} className="p-6 border border-gray-100 rounded-[24px] bg-white shadow-sm hover:shadow-md hover:border-[#8AB4F8] transition-all flex flex-col justify-between h-[220px]">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-black text-gray-900 text-[15px]">{new Date(po.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mt-1">{po.poNumber}</p>
                                        </div>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${po.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-600' : po.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : po.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{po.status.replace('_', ' ')}</span>
                                    </div>
                                    <p className="text-[15px] font-bold text-[#0066CC] truncate">{po.supplierName || po.supplier?.name || 'Unknown Supplier'}</p>
                                    <div className="flex justify-between items-center mt-3">
                                        <p className="text-[13px] text-gray-500 font-medium truncate">{po.title || 'Material Order'}</p>
                                        <p className="text-[14px] font-black text-gray-900">{formatCurrency(po.totalAmount)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    {(po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED' || po.status === 'PENDING_APPROVAL') ? (
                                        <button onClick={() => { setSelectedPOId(po.id); setIsGRNModalOpen(true); }} className="w-full py-2.5 bg-[#0066CC] text-white text-[13px] font-bold rounded-xl hover:bg-[#0052a3] transition-colors">Create GRN</button>
                                    ) : (
                                        <button className="w-full py-2.5 bg-gray-50 text-gray-600 text-[13px] font-bold rounded-xl hover:bg-gray-100 transition-colors">View Details</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isPOModalOpen && <PurchaseOrderModal isOpen={isPOModalOpen} onClose={() => { setIsPOModalOpen(false); fetchPOs(); }} onSubmit={createPurchaseOrderAPI} />}
            {isGRNModalOpen && <GRNModal isOpen={isGRNModalOpen} onClose={() => { setIsGRNModalOpen(false); fetchPOs(); }} poId={selectedPOId} onSubmit={createGRNAPI} />}
        </div>
    );
};

export default PurchaseOrderListPage;