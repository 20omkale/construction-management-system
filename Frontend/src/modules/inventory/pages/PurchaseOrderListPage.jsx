// src/modules/inventory/pages/PurchaseOrderListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Filter, Calendar, FileText, AlertCircle, Mic, MicOff, Send, Clock, CheckCircle } from 'lucide-react';
import { 
    getAllPurchaseOrdersAPI, 
    createPurchaseOrderAPI, 
    createGRNAPI, 
    submitPOForApprovalAPI, 
    approvePOAPI, 
    markPOAsOrderedAPI 
} from '../services/inventory.service';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import GRNModal from '../components/GRNModal';

const PurchaseOrderListPage = () => {
    const navigate = useNavigate();
    
    // 🚨 Read user directly from local storage
    const [user, setUser] = useState(null);
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [filterStatus, setFilterStatus] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
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

    // EXACT BACKEND WORKFLOW ROUTES
    const handleSubmitPO = async (poId) => {
        if (!window.confirm("Submit this Purchase Order for approval?")) return;
        try {
            const res = await submitPOForApprovalAPI(poId);
            if (!res.success) alert(res.message);
            fetchPOs();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleApprovePO = async (poId) => {
        if (!window.confirm("Approve this Purchase Order?")) return;
        try {
            const res = await approvePOAPI(poId);
            if (!res.success) alert(res.message);
            fetchPOs();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleMarkOrdered = async (poId) => {
        if (!window.confirm("Mark this Order as Sent/Ordered to supplier?")) return;
        try {
            const res = await markPOAsOrderedAPI(poId);
            if (!res.success) alert(res.message);
            fetchPOs();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Voice search is not supported in this browser.");
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            setSearchQuery(e.results[0][0].transcript);
            fetchPOs();
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
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans animate-in fade-in duration-500">
            <div>
                <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-xl font-black text-gray-900 hover:text-[#0066CC] transition-all mb-2">
                    <ArrowLeft size={24} strokeWidth={3} /> Purchase Orders
                </button>
            </div>

            {error && (
                <div className="ml-8 bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div><p className="font-bold text-sm">System Error</p><p className="text-xs mt-1">{error}</p></div>
                </div>
            )}

            <div className="ml-8 bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="relative w-full lg:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={isListening ? "Listening..." : "Search PO Number or Supplier..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchSubmit}
                        className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-[14px] font-bold outline-none focus:bg-white focus:border-[#0066CC] transition-all ${isListening ? 'ring-4 ring-blue-50' : ''}`}
                    />
                    <button onClick={handleVoiceSearch} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#0066CC]'}`}>
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative">
                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-6 py-3.5 border rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all ${filterStatus || fromDate || toDate ? 'bg-blue-50 border-[#0066CC] text-[#0066CC]' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}>
                            <Filter size={18} /> Filters {(filterStatus || fromDate || toDate) && <span className="w-2 h-2 rounded-full bg-[#0066CC]"></span>}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 top-16 w-80 bg-white border border-gray-100 shadow-2xl rounded-[2rem] p-6 z-50 animate-in fade-in slide-in-from-top-4 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Order Status</label>
                                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-[#0066CC]">
                                        <option value="">All Transactions</option>
                                        <option value="DRAFT">Drafts</option>
                                        <option value="PENDING_APPROVAL">Pending Approval</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="ORDERED">Ordered</option>
                                        <option value="RECEIVED">Received</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">From</label>
                                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-[#0066CC] text-gray-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">To</label>
                                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-[#0066CC] text-gray-600" />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-between items-center border-t border-gray-50">
                                    <button onClick={clearFilters} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Reset</button>
                                    <button onClick={() => setIsFilterOpen(false)} className="px-6 py-2.5 bg-[#0066CC] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-100">Apply</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsPOModalOpen(true)} className="flex items-center gap-2 px-8 py-3.5 bg-[#0066CC] text-white text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                        <Plus size={18} strokeWidth={3} /> Create Order
                    </button>
                </div>
            </div>

            <div className="ml-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synchronizing Records...</p>
                    </div>
                ) : purchaseOrders.length === 0 ? (
                    <div className="bg-white py-32 rounded-[3rem] border border-gray-100 shadow-sm text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><FileText size={36} className="text-gray-300" /></div>
                        <h3 className="text-[20px] font-black text-gray-900 mb-2">No Records Found</h3>
                        <p className="text-sm font-medium text-gray-400">Try adjusting your filters or create a new order.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {purchaseOrders.map((po) => {
                            const isAdmin = user?.userType === 'COMPANY_ADMIN';

                            return (
                                <div key={po.id} className="p-8 border border-slate-100 rounded-[2.5rem] bg-white shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all flex flex-col justify-between group h-[260px] relative overflow-hidden">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="font-black text-slate-900 text-lg leading-none">{new Date(po.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">{po.poNumber}</p>
                                            </div>
                                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                                                po.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-600' : 
                                                po.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 
                                                po.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 animate-pulse' : 
                                                po.status === 'APPROVED' ? 'bg-teal-50 text-teal-600' : 
                                                po.status === 'ORDERED' ? 'bg-blue-50 text-blue-600' : 
                                                po.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                                                'bg-gray-50 text-gray-600'
                                            }`}>
                                                {po.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-base font-black text-[#0066CC] truncate group-hover:text-blue-800 transition-colors uppercase tracking-tight">{po.supplierName || po.supplier?.name || 'Assigned Supplier'}</p>
                                        <div className="flex justify-between items-center mt-5">
                                            <p className="text-[12px] text-slate-500 font-bold truncate max-w-[120px]">{po.title || 'General Stock'}</p>
                                            <p className="text-base font-black text-slate-900">{formatCurrency(po.totalAmount)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-slate-50">
                                        
                                        {/* ROLE-BASED WORKFLOW */}
                                        {po.status === 'DRAFT' && isAdmin ? (
                                            <button onClick={() => handleSubmitPO(po.id)} className="w-full py-3.5 bg-slate-800 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2">
                                                <Send size={14} strokeWidth={3} /> Submit
                                            </button>
                                        ) : po.status === 'PENDING_APPROVAL' && isAdmin ? (
                                            <button onClick={() => handleApprovePO(po.id)} className="w-full py-3.5 bg-amber-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all flex items-center justify-center gap-2">
                                                <Clock size={14} strokeWidth={3} /> Approve
                                            </button>
                                        ) : po.status === 'APPROVED' && isAdmin ? (
                                            <button onClick={() => handleMarkOrdered(po.id)} className="w-full py-3.5 bg-teal-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-teal-600 shadow-lg shadow-teal-100 transition-all flex items-center justify-center gap-2">
                                                <Send size={14} strokeWidth={3} /> Order
                                            </button>
                                        ) : (po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') ? (
                                            <button onClick={() => { setSelectedPOId(po.id); setIsGRNModalOpen(true); }} className="w-full py-3.5 bg-[#0066CC] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-800 shadow-lg shadow-blue-50 transition-all flex items-center justify-center gap-2">
                                                <CheckCircle size={14} strokeWidth={3} /> Create GRN
                                            </button>
                                        ) : (
                                            <button className="w-full py-3.5 bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-[0.2em] rounded-2xl cursor-default transition-all">
                                                View Manifest
                                            </button>
                                        )}

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isPOModalOpen && <PurchaseOrderModal isOpen={isPOModalOpen} onClose={() => { setIsPOModalOpen(false); fetchPOs(); }} onSubmit={createPurchaseOrderAPI} />}
            {isGRNModalOpen && <GRNModal isOpen={isGRNModalOpen} onClose={() => { setIsGRNModalOpen(false); fetchPOs(); }} poId={selectedPOId} onSubmit={createGRNAPI} />}
        </div>
    );
};

export default PurchaseOrderListPage;