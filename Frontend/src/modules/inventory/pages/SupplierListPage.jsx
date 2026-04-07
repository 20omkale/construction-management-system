import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Phone, Mail, MapPin, User, Trash2, Edit, Loader2, X, ChevronRight } from 'lucide-react';
import { getAllSuppliersAPI } from '../services/inventory.service';
import api from '../../../shared/utils/api';

const SupplierListPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 🚨 UPDATED: formData now includes all fields required by supplier.validations.js
    const [formData, setFormData] = useState({
        name: '',
        type: 'DISTRIBUTOR',
        subtypes: [], // Required by Zod
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        gstNumber: '',
        defaultPaymentTerm: 'NET_30', // Required by Zod
        tags: [] // Required by Zod
    });

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await getAllSuppliersAPI();
            const list = res.data?.data || res.data || [];
            setSuppliers(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try {
            // Clean up empty optional strings to null to satisfy strict validation
            const submissionData = {
                ...formData,
                email: formData.email || null,
                gstNumber: formData.gstNumber || null,
                address: formData.address || null,
                city: formData.city || null,
                state: formData.state || null
            };

            await api.post('/suppliers', submissionData);
            setIsModalOpen(false);
            fetchSuppliers();
            // Reset to defaults
            setFormData({
                name: '', type: 'DISTRIBUTOR', subtypes: [], contactPerson: '', email: '', 
                phone: '', address: '', city: '', state: '', country: 'India', 
                gstNumber: '', defaultPaymentTerm: 'NET_30', tags: []
            });
        } catch (error) {
            // Display exact error from Zod validation if available
            const errorMsg = error.response?.data?.errors 
                ? error.response.data.errors.map(err => `${err.field}: ${err.message}`).join(', ')
                : error.response?.data?.message || "Validation Error";
            alert(`Registration Failed: ${errorMsg}`);
            console.error("Full Error Object:", error.response?.data);
        }
    };

    const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter(s => 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-[#F8FAFC] min-h-screen">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Supplier Directory</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Vendor Management</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-[#0066CC] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                    <Plus size={18} strokeWidth={3} /> Add Supplier
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search suppliers..." 
                    className="w-full pl-16 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="text-slate-400 font-black uppercase text-[10px]">Syncing Database...</p>
                </div>
            ) : filteredSuppliers.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
                    <User className="text-slate-200 mx-auto mb-4" size={48} />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Suppliers Registered</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group relative">
                            <div className="absolute top-8 right-8">
                                <span className="bg-blue-50 text-[#0066CC] text-[10px] font-black px-4 py-1.5 rounded-full uppercase">
                                    {supplier.type}
                                </span>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-slate-800 line-clamp-1">{supplier.name}</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-2">
                                    <User size={12} /> {supplier.contactPerson}
                                </p>
                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-4 text-slate-600">
                                        <Phone size={16} className="text-slate-400" />
                                        <span className="text-xs font-black">{supplier.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600">
                                        <Mail size={16} className="text-slate-400" />
                                        <span className="text-xs font-black truncate">{supplier.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-600">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="text-xs font-black">{supplier.city || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in duration-300 overflow-hidden">
                        <div className="px-10 py-8 flex justify-between items-center border-b border-slate-50 bg-slate-50/50">
                            <h2 className="text-2xl font-black text-slate-800">Register Vendor</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 border border-slate-100 rounded-full hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSupplier} className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="Reliance Steel" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none">
                                        <option value="MANUFACTURER">Manufacturer</option>
                                        <option value="DISTRIBUTOR">Distributor</option>
                                        <option value="WHOLESALER">Wholesaler</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact Person</label>
                                    <input required value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="Enter name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">GST ID</label>
                                    <input value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none uppercase" placeholder="22AAAAA0000A1Z5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Primary Phone</label>
                                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="+91" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Work Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="vendor@email.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">HQ City</label>
                                    <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="Pune" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">State</label>
                                    <input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none" placeholder="Maharashtra" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#0066CC] text-white py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-800 transition-all mt-4">Confirm Registration</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierListPage;