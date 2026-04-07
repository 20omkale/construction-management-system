// src/modules/projects/pages/WPRListPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, FileText, AlertCircle, Send, Clock, Loader2, Eye } from 'lucide-react';
import { getProjectWPRsAPI, updateWPRStatusAPI } from '../services/wpr.service'; // Removed generateWPRAPI
import CreateWPRModal from '../components/CreateWPRModal';
import WPRDetailsModal from '../components/WPRDetailsModal';

const WPRListPage = ({ projectId }) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const [wprs, setWprs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal States
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedWPR, setSelectedWPR] = useState(null);

    const fetchWPRs = async () => {
        if (!projectId) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await getProjectWPRsAPI(projectId);
            if (response.success) setWprs(response.data);
            else setError(response.message);
        } catch (err) {
            setError(err.message || "Failed to load Weekly Reports.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchWPRs(); }, [projectId]);

    const handleViewDetails = (wpr) => {
        setSelectedWPR(wpr);
        setIsDetailsModalOpen(true);
    };

    const handleSubmitWPR = async (id) => {
        if (!window.confirm("Submit this Weekly Report for Admin Approval?")) return;
        try {
            await updateWPRStatusAPI(id, 'PENDING_APPROVAL');
            fetchWPRs();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleApproveWPR = async (id) => {
        if (!window.confirm("Approve this Weekly Report? This will lock the data.")) return;
        try {
            await updateWPRStatusAPI(id, 'APPROVED', 'Approved by Admin');
            fetchWPRs();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const isAdmin = user?.userType === 'COMPANY_ADMIN';

    return (
        <div className="w-full space-y-6 font-sans animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-gray-900 text-[18px]">Weekly Progress Reports</h3>
                    <p className="text-[12px] text-gray-500 mt-1">Aggregated summaries from daily operations.</p>
                </div>
                <button onClick={() => setIsGenerateModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-[13px] font-medium rounded-md hover:bg-[#0052a3] transition-all shadow-sm">
                    <Plus size={16} /> Generate WPR
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-[13px] font-medium">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" /></div>
            ) : wprs.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                    <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-500">No Weekly Reports generated for this project yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wprs.map((wpr) => {
                        let statusColor = "text-gray-500";
                        let statusLabel = wpr.status.replace('_', ' ');
                        if (wpr.status === 'PENDING_APPROVAL') { statusColor = "text-[#E02020]"; statusLabel = "Pending Review"; }
                        if (wpr.status === 'APPROVED') { statusColor = "text-[#00A859]"; }

                        return (
                            <div key={wpr.id} className="p-5 border border-gray-200 rounded-[12px] bg-white hover:border-[#0066CC] hover:shadow-md transition-all flex flex-col justify-between h-[160px]">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-gray-900 text-[14px]">
                                            {new Date(wpr.weekStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(wpr.weekEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </p>
                                        <span className={`text-[11px] font-bold ${statusColor}`}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-[12px] text-gray-600 mt-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Total Labor</span>
                                            <strong className="text-gray-900">{wpr.totalLaborCount || 0}</strong>
                                        </div>
                                        <div className="w-px bg-gray-200"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Eq. Hours</span>
                                            <strong className="text-gray-900">{wpr.totalEquipmentHours || 0} hrs</strong>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-end mt-4">
                                    <p className="text-[11px] text-gray-400 truncate max-w-[80px]">
                                        By: {wpr.createdBy?.name || 'System'}
                                    </p>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleViewDetails(wpr)} 
                                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-[4px] hover:bg-gray-200 transition-all flex items-center gap-1"
                                        >
                                            <Eye size={12} /> View
                                        </button>
                                        {wpr.status === 'DRAFT' && (
                                            <button onClick={() => handleSubmitWPR(wpr.id)} className="px-3 py-1.5 bg-[#0066CC] text-white text-[11px] font-medium rounded-[4px] hover:bg-blue-800 transition-all flex items-center gap-1">
                                                <Send size={12} /> Submit
                                            </button>
                                        )}
                                        {wpr.status === 'PENDING_APPROVAL' && isAdmin && (
                                            <button onClick={() => handleApproveWPR(wpr.id)} className="px-3 py-1.5 bg-[#00A859] text-white text-[11px] font-medium rounded-[4px] hover:bg-green-700 transition-all flex items-center gap-1">
                                                <Clock size={12} /> Approve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isGenerateModalOpen && (
                <CreateWPRModal 
                    isOpen={isGenerateModalOpen} 
                    onClose={() => setIsGenerateModalOpen(false)} 
                    projectId={projectId}
                    // 🚨 THIS IS THE CRUCIAL CHANGE: Pass onSuccess prop
                    onSuccess={() => {
                        setIsGenerateModalOpen(false); // Close the modal
                        fetchWPRs(); // Refresh the list
                    }} 
                />
            )}

            {isDetailsModalOpen && (
                <WPRDetailsModal 
                    isOpen={isDetailsModalOpen} 
                    onClose={() => setIsDetailsModalOpen(false)} 
                    wpr={selectedWPR} 
                />
            )}
        </div>
    );
};

export default WPRListPage;