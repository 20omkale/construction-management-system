// src/modules/inventory/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Calendar, FileText, AlertCircle, ArrowRightLeft, Send, Clock, CheckCircle } from 'lucide-react';
import { 
    getGlobalInventoryAPI, 
    getAllPurchaseOrdersAPI, 
    createPurchaseOrderAPI, 
    createGRNAPI,
    submitPOForApprovalAPI, 
    approvePOAPI, 
    markPOAsOrderedAPI 
} from '../services/inventory.service';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import GRNModal from '../components/GRNModal';

const InventoryPage = () => {
    const navigate = useNavigate();
    
    // 🚨 Read user directly from local storage
    const [user, setUser] = useState(null);
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const [summaryData, setSummaryData] = useState(null);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    
    const [isInvLoading, setIsInvLoading] = useState(true);
    const [isPOLoading, setIsPOLoading] = useState(true);
    
    const [invError, setInvError] = useState('');
    const [poError, setPoError] = useState('');

    // Modal States
    const [isPOModalOpen, setIsPOModalOpen] = useState(false);
    const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
    const [selectedPOId, setSelectedPOId] = useState(null);

    const fetchPOs = async () => {
        try {
            const res = await getAllPurchaseOrdersAPI({ page: 1, limit: 4 });
            if (res.success) setPurchaseOrders(res.data);
            else setPoError(res.message);
        } catch (err) {
            setPoError(err.message || "PO Validation Error");
        } finally {
            setIsPOLoading(false);
        }
    };

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await getGlobalInventoryAPI(1, 1);
                if (res.success) setSummaryData(res.data.summary);
                else setInvError(res.message);
            } catch (err) {
                setInvError(err.message || "Failed to load inventory stats");
            } finally {
                setIsInvLoading(false);
            }
        };

        fetchInventory();
        fetchPOs();
    }, []);

    // Workflow Handlers
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
        if (!window.confirm("Mark this Order as Sent to supplier?")) return;
        try {
            const res = await markPOAsOrderedAPI(poId);
            if (!res.success) alert(res.message);
            fetchPOs();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
    };

    const handleOpenGRN = (poId) => {
        setSelectedPOId(poId);
        setIsGRNModalOpen(true);
    };

    const total = summaryData?.totalValue || 4875000;
    const equipment = summaryData?.totalEquipmentValue || 3035000;
    const material = summaryData?.totalMaterialValue || 1840000;
    const eqPct = (equipment / total) * 100 || 62;
    const matPct = (material / total) * 100 || 38;

    return (
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans bg-[#F5F7FA] min-h-screen animate-in fade-in duration-500">
            
            {/* TOP ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory Dashboard Card */}
                <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6 text-[16px]">Inventory Dashboard</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        {isInvLoading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC] mx-auto"></div>
                        ) : invError ? (
                            <div className="text-red-500 text-sm font-bold">{invError}</div>
                        ) : (
                            <>
                                <div className="relative w-32 h-32 shrink-0">
                                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                        <circle cx="18" cy="18" r="14" fill="none" className="text-[#0066CC]" strokeWidth="6" stroke="currentColor" />
                                        <circle cx="18" cy="18" r="14" fill="none" className="text-[#00A859]" strokeWidth="6" strokeDasharray={`${eqPct} 100`} stroke="currentColor" />
                                    </svg>
                                </div>
                                
                                <div className="flex flex-col w-full gap-2">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#00A859]"></div> <span className="text-gray-800 font-medium">Equipment:</span></div>
                                        <span className="text-[#00A859] font-bold">{formatCurrency(equipment)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0066CC]"></div> <span className="text-gray-800 font-medium">Material:</span></div>
                                        <span className="text-[#0066CC] font-bold">{formatCurrency(material)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] pt-3">
                                        <span className="text-gray-800 font-medium ml-4">Inventory:</span>
                                        <span className="text-gray-900 font-bold">{formatCurrency(total)}</span>
                                    </div>
                                    <button onClick={() => navigate('/inventory/list')} className="mt-4 w-full py-2 bg-[#0066CC] text-white text-[13px] font-medium rounded-md hover:bg-[#0052a3] transition-colors">
                                        View Inventory
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Budget Card */}
                <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 mb-6 text-[16px]">Budget</h3>
                    <div className="w-full bg-[#B3D4FF] h-4 rounded-full overflow-hidden mb-6 flex">
                        <div className="bg-[#0066CC] h-full transition-all duration-1000" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex justify-between items-end text-[13px]">
                        <div className="space-y-1.5">
                            <p className="text-gray-600">Total Contract: <span className="font-bold text-gray-900">₹20,00,000</span></p>
                            <p className="text-gray-600">Used: <span className="font-bold text-gray-900">₹12,00,000</span></p>
                        </div>
                        <p className="text-gray-600">Remaining: <span className="font-bold text-gray-900">₹8,00,000</span></p>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: Recent Activity */}
            <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-[16px]">Recent activity</h3>
                    <button className="text-[#0066CC] text-[13px] font-medium hover:underline">View all</button>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F0F6FF] text-[#0066CC] rounded-lg flex items-center justify-center"><FileText size={18}/></div>
                            <div>
                                <p className="font-medium text-gray-900 text-[13px]">Materials Received</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Material Cement Batch ID</p>
                            </div>
                        </div>
                        <span className="text-[11px] text-gray-400">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F0F6FF] text-[#0066CC] rounded-lg flex items-center justify-center"><AlertCircle size={18}/></div>
                            <div>
                                <p className="font-medium text-gray-900 text-[13px]">Low Stock Alert</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Material Cement Batch ID</p>
                            </div>
                        </div>
                        <span className="text-[11px] text-gray-400">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#F0F6FF] text-[#0066CC] rounded-lg flex items-center justify-center"><ArrowRightLeft size={18}/></div>
                            <div>
                                <p className="font-medium text-gray-900 text-[13px]">Material Transferred</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">24 Dec 2025</p>
                            </div>
                        </div>
                        <span className="text-[11px] text-gray-400">5h ago</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: Purchase Orders */}
            <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 text-[16px]">Purchase Orders</h3>
                    <button onClick={() => setIsPOModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white text-[13px] font-medium rounded-md hover:bg-[#0052a3] transition-all">
                        <Plus size={16} /> Create Purchase Order
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                        <input type="text" placeholder="MM/DD/YYYY" className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#0066CC] transition-all w-40" />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter size={14} /> Filter
                    </button>
                </div>

                {isPOLoading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0066CC]"></div></div>
                ) : poError ? (
                    <div className="text-red-500 text-sm font-bold text-center py-6">{poError}</div>
                ) : purchaseOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm font-medium border border-dashed border-gray-200 rounded-lg">
                        No purchase orders found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {purchaseOrders.map((po) => {
                            // Map backend status to Figma UI colors/labels
                            let statusColor = "text-gray-500";
                            let statusLabel = po.status.replace('_', ' ');
                            if (po.status === 'RECEIVED' || po.status === 'PARTIALLY_RECEIVED') statusColor = "text-[#0066CC]";
                            if (po.status === 'PENDING_APPROVAL' || po.status === 'DRAFT') { statusColor = "text-[#E02020]"; statusLabel = "Pending"; }
                            if (po.status === 'COMPLETED' || po.status === 'CLOSED') { statusColor = "text-[#00A859]"; statusLabel = "Completed"; }

                            // Role Based checks
                            const isAdmin = user?.userType === 'COMPANY_ADMIN';

                            return (
                                <div key={po.id} className="p-5 border border-gray-200 rounded-[8px] bg-white hover:border-[#0066CC] transition-all flex flex-col justify-between h-[120px]">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-gray-900 text-[14px]">
                                            {new Date(po.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </p>
                                        <span className={`text-[12px] font-medium ${statusColor}`}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                    
                                    <p className="text-[11px] text-gray-400 mb-6">{po.poNumber}</p>
                                    
                                    <div className="flex justify-between items-end">
                                        <p className="text-[13px] font-medium text-[#0066CC] truncate max-w-[150px]">{po.supplierName || po.supplier?.name || 'Supplier Name'}</p>
                                        
                                        {/* ROLE-BASED WORKFLOW BUTTONS */}
                                        <div>
                                            {po.status === 'DRAFT' && isAdmin ? (
                                                <button onClick={() => handleSubmitPO(po.id)} className="px-4 py-1.5 bg-[#0066CC] text-white text-[11px] font-medium rounded-[4px] hover:bg-blue-800 transition-all">
                                                    Submit
                                                </button>
                                            ) : po.status === 'PENDING_APPROVAL' && isAdmin ? (
                                                <button onClick={() => handleApprovePO(po.id)} className="px-4 py-1.5 bg-[#0066CC] text-white text-[11px] font-medium rounded-[4px] hover:bg-blue-800 transition-all">
                                                    Approve
                                                </button>
                                            ) : po.status === 'APPROVED' && isAdmin ? (
                                                <button onClick={() => handleMarkOrdered(po.id)} className="px-4 py-1.5 bg-[#0066CC] text-white text-[11px] font-medium rounded-[4px] hover:bg-blue-800 transition-all">
                                                    Order
                                                </button>
                                            ) : (po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') ? (
                                                <button onClick={() => handleOpenGRN(po.id)} className="px-4 py-1.5 bg-[#0066CC] text-white text-[11px] font-medium rounded-[4px] hover:bg-blue-800 transition-all">
                                                    Create GRN
                                                </button>
                                            ) : null}
                                        </div>
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

export default InventoryPage;