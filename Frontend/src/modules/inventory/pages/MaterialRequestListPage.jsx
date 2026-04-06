// src/modules/inventory/pages/MaterialRequestListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, FileText, CheckCircle2, XCircle, Clock, Mic, MicOff } from 'lucide-react';
import { getMaterialRequestsAPI } from '../services/materialRequest.service';

const MaterialRequestListPage = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Tabs & Voice Search
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    
    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterUrgency, setFilterUrgency] = useState('ALL');

    useEffect(() => {
        fetchRequests(activeTab);
    }, [activeTab]);

    const fetchRequests = async (statusFilter) => {
        setIsLoading(true);
        try {
            const response = await getMaterialRequestsAPI(1, 50, statusFilter);
            if (response.success) {
                setRequests(response.data);
                setFilteredRequests(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Local Search & Filter Logic
    useEffect(() => {
        let result = requests;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(req => req.materialName?.toLowerCase().includes(q) || req.requestNo?.toLowerCase().includes(q));
        }
        if (filterUrgency !== 'ALL') {
            result = result.filter(req => req.urgency === filterUrgency);
        }
        setFilteredRequests(result);
    }, [searchQuery, filterUrgency, requests]);

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': case 'DELIVERED': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1"><CheckCircle2 size={12}/> {status}</span>;
            case 'REJECTED': return <span className="px-3 py-1 bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1"><XCircle size={12}/> {status}</span>;
            default: return <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[11px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1"><Clock size={12}/> PENDING</span>;
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
            <div>
                <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-[#0066CC] transition-colors mb-2">
                    <ArrowLeft size={24} /> Material Requests
                </button>
            </div>

            <div className="flex bg-gray-100/80 p-1.5 rounded-full w-fit ml-8">
                {['ALL', 'REQUESTED', 'APPROVED', 'REJECTED'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${activeTab === tab ? 'bg-[#0066CC] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                        {tab === 'REQUESTED' ? 'Pending' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="ml-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={isListening ? "Listening..." : "Search Request No or Material..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-2xl text-[14px] outline-none focus:border-[#0066CC] transition-all shadow-sm ${isListening ? 'ring-2 ring-blue-100' : ''}`}
                    />
                    <button onClick={handleVoiceSearch} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#0066CC]'}`}>
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>
                
                <div className="relative">
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-bold shadow-sm transition-colors ${isFilterOpen || filterUrgency !== 'ALL' ? 'bg-blue-50 border-[#0066CC] text-[#0066CC]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                        <Filter size={18} /> Filters {(filterUrgency !== 'ALL') && <span className="w-2 h-2 rounded-full bg-[#0066CC]"></span>}
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 top-14 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Urgency</label>
                                    <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:border-[#0066CC]">
                                        <option value="ALL">Any Urgency</option>
                                        <option value="HIGH">High</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="LOW">Low</option>
                                    </select>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button onClick={() => { setFilterUrgency('ALL'); setIsFilterOpen(false); }} className="text-xs font-bold text-red-500 hover:underline">Clear</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="ml-8 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066CC]"></div></div>
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white py-16 rounded-[24px] border border-gray-100 shadow-sm text-center"><FileText size={48} className="mx-auto text-gray-200 mb-4" /><h3 className="text-[16px] font-bold text-gray-900 mb-1">No requests found</h3></div>
                ) : (
                    filteredRequests.map((req) => (
                        <div key={req.id} onClick={() => navigate(`/inventory/requests/${req.id}`)} className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#8AB4F8] transition-all cursor-pointer flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0066CC] shrink-0"><FileText size={22} /></div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-[16px] font-bold text-gray-900">{req.materialName || req.material?.name}</h4>
                                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase">{req.requestNo}</span>
                                    </div>
                                    <p className="text-[13px] text-gray-500 font-medium">Project: <span className="font-bold text-gray-900">{req.project?.name || 'Global'}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-8 pt-4 sm:pt-0">
                                <div className="text-right">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Quantity</p>
                                    <p className="text-[15px] font-black text-[#0066CC]">{req.quantity} {req.unit || req.material?.unit}</p>
                                </div>
                                <div>{getStatusBadge(req.status)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MaterialRequestListPage;