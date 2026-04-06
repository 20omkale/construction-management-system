// src/modules/inventory/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Calendar, FileText, AlertCircle, ArrowRightLeft } from 'lucide-react';
// FIXED: Imported the create functions
import { getGlobalInventoryAPI, getAllPurchaseOrdersAPI, createPurchaseOrderAPI, createGRNAPI } from '../services/inventory.service';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import GRNModal from '../components/GRNModal';

const InventoryPage = () => {
    const navigate = useNavigate();

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
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
            
            <h2 className="text-[22px] font-black text-gray-900 tracking-tight">Inventory Dashboard</h2>

            {/* TOP ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8">
                    {isInvLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC] mx-auto"></div>
                    ) : invError ? (
                        <div className="text-red-500 text-sm font-bold">{invError}</div>
                    ) : (
                        <>
                            <div className="relative w-40 h-40 shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <circle cx="18" cy="18" r="16" fill="none" className="text-gray-100" strokeWidth="4" stroke="currentColor" />
                                    <circle cx="18" cy="18" r="16" fill="none" className="text-emerald-400" strokeWidth="4" strokeDasharray={`${eqPct} 100`} stroke="currentColor" />
                                    <circle cx="18" cy="18" r="16" fill="none" className="text-[#0066CC]" strokeWidth="4" strokeDasharray={`${matPct} 100`} strokeDashoffset={`-${eqPct}`} stroke="currentColor" />
                                </svg>
                            </div>
                            
                            <div className="flex flex-col w-full gap-3">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> <span className="text-gray-600">Equipment:</span></div>
                                    <span className="text-emerald-500">{formatCurrency(equipment)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0066CC]"></div> <span className="text-gray-600">Material:</span></div>
                                    <span className="text-[#0066CC]">{formatCurrency(material)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-gray-100">
                                    <span className="text-gray-900">Inventory:</span>
                                    <span className="text-gray-900">{formatCurrency(total)}</span>
                                </div>
                                <button onClick={() => navigate('/inventory/list')} className="mt-3 w-full py-2.5 bg-[#0066CC] text-white text-[13px] font-bold rounded-xl hover:bg-[#0052a3] transition-colors shadow-md">
                                    View Inventory
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 mb-5 text-[16px]">Budget</h3>
                    <div className="w-full bg-blue-50 h-6 rounded-full overflow-hidden mb-6 flex">
                        <div className="bg-[#0066CC] h-full rounded-full transition-all duration-1000" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex justify-between items-end text-sm">
                        <div className="space-y-1">
                            <p className="text-gray-500 font-medium">Total Contract: <span className="font-black text-gray-900">₹20,00,000</span></p>
                            <p className="text-gray-500 font-medium">Used: <span className="font-black text-gray-900">₹12,00,000</span></p>
                        </div>
                        <p className="text-gray-500 font-medium">Remaining: <span className="font-black text-gray-900">₹8,00,000</span></p>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW */}
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 text-[16px]">Recent activity</h3>
                    <button className="text-[#0066CC] text-[13px] font-bold hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-[#0066CC] rounded-xl flex items-center justify-center"><FileText size={18}/></div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Materials Received</p>
                                <p className="text-xs text-gray-500">Material Cement Batch ID</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 font-bold">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-[#0066CC] rounded-xl flex items-center justify-center"><AlertCircle size={18}/></div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Low Stock Alert</p>
                                <p className="text-xs text-gray-500">Material Cement Batch ID</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 font-bold">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border-b border-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-[#0066CC] rounded-xl flex items-center justify-center"><ArrowRightLeft size={18}/></div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Material Transferred</p>
                                <p className="text-xs text-gray-500">24 Dec 2025</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 font-bold">5h ago</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 text-[16px]">Purchase Orders</h3>
                    {/* FIXED: Changed from navigate('/inventory/po') to setIsPOModalOpen(true) */}
                    <button onClick={() => setIsPOModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-[#0066CC] text-[13px] font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
                        <Plus size={16} /> Create Purchase Order
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                        <input type="text" placeholder="MM/DD/YYYY" className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#0066CC] transition-all w-36" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        <Filter size={14} /> Filter
                    </button>
                </div>

                {isPOLoading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC]"></div></div>
                ) : poError ? (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center">
                        <AlertCircle className="mx-auto mb-2" size={24} />
                        <p className="font-bold text-sm">Could not load Purchase Orders</p>
                        <p className="text-xs mt-1">{poError}</p>
                    </div>
                ) : purchaseOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-2xl">
                        No purchase orders found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {purchaseOrders.map((po) => (
                            <div key={po.id} className="p-5 border border-gray-100 rounded-[16px] bg-white shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-black text-gray-900 text-sm">
                                        {new Date(po.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                    </p>
                                    <span className={`text-[11px] font-bold ${
                                        po.status === 'RECEIVED' ? 'text-[#0066CC]' :
                                        po.status === 'COMPLETED' ? 'text-emerald-500' :
                                        'text-red-500'
                                    }`}>
                                        {po.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 font-bold mb-3">{po.poNumber}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-[13px] font-bold text-[#0066CC]">{po.supplierName || 'Supplier Name'}</p>
                                    {(po.status === 'ORDERED' || po.status === 'PENDING_APPROVAL' || po.status === 'DRAFT') ? (
                                        <button onClick={() => handleOpenGRN(po.id)} className="px-4 py-1.5 bg-[#0066CC] text-white text-[11px] font-bold rounded-lg hover:bg-[#0052a3]">
                                            Create GRN
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FIXED: Passing onSubmit functions so they don't crash when clicked */}
            {isPOModalOpen && <PurchaseOrderModal isOpen={isPOModalOpen} onClose={() => { setIsPOModalOpen(false); fetchPOs(); }} onSubmit={createPurchaseOrderAPI} />}
            {isGRNModalOpen && <GRNModal isOpen={isGRNModalOpen} onClose={() => { setIsGRNModalOpen(false); fetchPOs(); }} poId={selectedPOId} onSubmit={createGRNAPI} />}
        </div>
    );
};

export default InventoryPage;