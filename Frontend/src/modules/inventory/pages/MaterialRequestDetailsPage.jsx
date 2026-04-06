// src/modules/inventory/pages/MaterialRequestDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, AlertCircle, Package } from 'lucide-react';
import { getMaterialRequestByIdAPI, updateMaterialRequestStatusAPI } from '../services/materialRequest.service';

const MaterialRequestDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [requestData, setRequestData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const response = await getMaterialRequestByIdAPI(id);
            if (response.success) {
                setRequestData(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        setIsProcessing(true);
        try {
            const payload = { status: newStatus };
            if (newStatus === 'REJECTED') {
                payload.rejectionReason = prompt("Enter rejection reason (optional):") || "Rejected by Admin";
            }
            
            const response = await updateMaterialRequestStatusAPI(id, payload);
            if (response.success) {
                alert(`Request successfully marked as ${newStatus}`);
                fetchDetails(); // Refresh data
            } else {
                alert(response.message);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0066CC]"></div></div>;
    
    if (error || !requestData) return <div className="p-8 text-center text-red-500 font-bold">{error || "Request not found"}</div>;

    const { project, material, requestedBy, status, quantity, unit, purpose, requestNo, createdAt } = requestData;

    return (
        <div className="max-w-[1000px] mx-auto p-4 sm:p-6 space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[15px] font-bold text-gray-600 hover:text-[#0066CC] transition-colors mb-4">
                <ArrowLeft size={20} /> Back to Requests
            </button>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-gray-900">{requestNo}</h2>
                            <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg ${
                                status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                                'bg-orange-50 text-orange-600'
                            }`}>
                                {status}
                            </span>
                        </div>
                        <p className="text-gray-500 font-medium text-sm">
                            Requested by <span className="font-bold text-gray-900">{requestedBy?.name || 'Unknown'}</span> on {new Date(createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Action Buttons - Only show if PENDING/REQUESTED */}
                    {status === 'REQUESTED' && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleUpdateStatus('REJECTED')}
                                disabled={isProcessing}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                <XCircle size={18} /> Reject
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus('APPROVED')}
                                disabled={isProcessing}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] text-white hover:bg-[#0052a3] font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                            >
                                <CheckCircle size={18} /> Approve
                            </button>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="p-8 bg-gray-50/50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project Info */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Project Site</p>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{project?.name || 'Global Warehouse'}</h3>
                            <p className="text-sm text-gray-500">{project?.location || 'No location set'}</p>
                        </div>

                        {/* Purpose Info */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Purpose / Notes</p>
                            <p className="text-sm font-medium text-gray-700">{purpose || 'No additional notes provided by the requester.'}</p>
                        </div>
                    </div>

                    {/* Material Table */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package size={18} className="text-[#0066CC]" /> Requested Material
                        </h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-3 font-bold text-gray-400 uppercase text-xs tracking-wider">Material Details</th>
                                        <th className="pb-3 font-bold text-gray-400 uppercase text-xs tracking-wider text-right">Quantity Required</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-50 group hover:bg-gray-50 transition-colors">
                                        <td className="py-4">
                                            <p className="font-bold text-gray-900 text-sm">{requestData.materialName || material?.name}</p>
                                            {material?.materialCode && <p className="text-xs text-gray-400 mt-1">{material.materialCode}</p>}
                                        </td>
                                        <td className="py-4 text-right">
                                            <p className="font-black text-[#0066CC] text-lg">{quantity} {unit || material?.unit}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialRequestDetailsPage;