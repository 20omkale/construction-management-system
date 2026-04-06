// src/modules/dashboard/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { getAdminDashboardAPI } from '../services/dashboard.service';
import { 
    LayoutDashboard, FolderKanban, ClipboardCheck, Wallet, 
    Activity, Clock, AlertCircle, ArrowRight 
} from 'lucide-react';

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getAdminDashboardAPI();
                if (response.success) {
                    setDashboardData(response.data);
                } else {
                    setError(response.message || "Failed to load dashboard data.");
                }
            } catch (err) {
                setError(err.message || "Network Error. Check backend connection.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load Dashboard</h2>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    const { quickActions, recentActivity } = dashboardData || {};

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <LayoutDashboard className="text-[#0066CC]" size={28} />
                <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Main Dashboard</h1>
            </div>

            {/* Quick Actions / Statistics Cards */}
            {quickActions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Projects Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-50 text-[#0066CC] rounded-2xl flex items-center justify-center">
                                <FolderKanban size={24} />
                            </div>
                            <span className="text-xs font-bold px-3 py-1 bg-gray-50 text-gray-500 rounded-lg uppercase">{quickActions.projects.unit}</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-bold mb-1">{quickActions.projects.label}</h3>
                        <p className="text-[28px] font-black text-gray-900">{quickActions.projects.count}</p>
                    </div>

                    {/* Inventory Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Wallet size={24} />
                            </div>
                            <span className="text-xs font-bold px-3 py-1 bg-gray-50 text-gray-500 rounded-lg uppercase">Total Value</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-bold mb-1">{quickActions.inventory.label}</h3>
                        <p className="text-[24px] font-black text-gray-900 truncate" title={quickActions.inventory.formattedValue}>
                            {quickActions.inventory.formattedValue}
                        </p>
                    </div>

                    {/* Approvals Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        {quickActions.approvals.count > 0 && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -z-10"></div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                                <ClipboardCheck size={24} />
                            </div>
                            <span className="text-xs font-bold px-3 py-1 bg-orange-50 text-orange-600 rounded-lg uppercase">{quickActions.approvals.unit}</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-bold mb-1">{quickActions.approvals.label}</h3>
                        <p className="text-[28px] font-black text-gray-900">{quickActions.approvals.count}</p>
                    </div>

                    {/* Transactions Card */}
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                <Activity size={24} />
                            </div>
                            <span className="text-xs font-bold px-3 py-1 bg-gray-50 text-gray-500 rounded-lg uppercase">Pending</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-bold mb-1">{quickActions.transactions.label}</h3>
                        <p className="text-[28px] font-black text-gray-900">{quickActions.transactions.count}</p>
                    </div>
                </div>
            )}

            {/* Recent Activity List */}
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm mt-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <Clock className="text-[#0066CC]" size={20} /> Recent Activity
                    </h3>
                </div>

                {!recentActivity || recentActivity.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                        <p className="text-gray-400 font-medium">No recent activities found in your projects.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={activity.id || index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-blue-50 text-[#0066CC] rounded-2xl flex items-center justify-center group-hover:bg-[#0066CC] group-hover:text-white transition-colors">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-[15px]">{activity.title}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mt-0.5">
                                            <span className="text-[#0066CC]">{activity.projectName}</span>
                                            <span>•</span>
                                            <span>{activity.description}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-xs text-gray-400 font-bold">
                                        {new Date(activity.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {activity.actionLink && (
                                        <a href={activity.actionLink} className="text-xs font-bold text-[#0066CC] hover:underline flex items-center gap-1">
                                            {activity.actionText} <ArrowRight size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;