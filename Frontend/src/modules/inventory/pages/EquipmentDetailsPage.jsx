// src/modules/inventory/pages/EquipmentDetailsPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Wrench, Truck } from 'lucide-react';

const EquipmentDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div>
                <button 
                    onClick={() => navigate('/inventory/list')}
                    className="flex items-center gap-2 text-[20px] font-bold text-gray-900 hover:text-[#0066CC] transition-colors mb-1"
                >
                    <ArrowLeft size={24} /> Back to Equipment List
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0066CC]">
                    <Truck size={40} />
                </div>
                
                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Equipment Details</h2>
                        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">ID: {id}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Status</p>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[12px] font-bold rounded-lg">Available</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Ownership</p>
                            <p className="text-[14px] font-bold text-gray-900">Owned</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Type</p>
                            <p className="text-[14px] font-bold text-gray-900 flex items-center gap-1"><Wrench size={14}/> Heavy Machinery</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetailsPage;