import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';

const MaterialDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/inventory/list')} className="flex items-center gap-2 text-[20px] font-bold text-gray-900 hover:text-[#0066CC]">
                    <ArrowLeft size={24} /> Material Details
                </button>
                <div className="flex gap-3">
                    <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Edit3 size={20}/></button>
                    <button className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={20}/></button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">ID</p><p className="font-bold">{id}</p></div>
                    <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Name</p><p className="font-bold">Cement (OPC)</p></div>
                    <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Unit</p><p className="font-bold">Bags</p></div>
                    <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Stock</p><p className="font-bold text-[#0066CC]">1,200</p></div>
                </div>
            </div>
        </div>
    );
};

export default MaterialDetailsPage;