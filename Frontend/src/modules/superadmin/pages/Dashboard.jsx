import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Ban, Users, Home, AlertTriangle, UserPlus, Loader2 } from 'lucide-react';
import { companyService } from '../services/company.service';

const Dashboard = () => {
  const [data, setData] = useState({ stats: null, recentActivities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await companyService.getDashboardData();
      if (response.success) {
        setData({
          stats: response.data.stats,
          recentActivities: response.data.recentActivities || []
        });
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
    const interval = setInterval(() => fetchDashboardData(false), 15000); // 15s silent polling
    return () => clearInterval(interval);
  }, []);

  // Calculate trends from the activity log for growth metrics
  const trends = useMemo(() => {
    const activities = data.recentActivities;
    return {
      newCompanies: activities.filter(a => a.type === 'company_created').length,
      newUsers: activities.filter(a => a.type === 'user_created').length || 0, // Fallback if not tracked yet
    };
  }, [data.recentActivities]);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#0f62fe]" /></div>;
  if (error) return <div className="flex h-[80vh] items-center justify-center text-slate-500 font-medium">{error}</div>;

  const { stats, recentActivities } = data;

  return (
    // 🚨 PRO FIX: `mx-auto` and `max-w-[1200px]` centers the dashboard beautifully on any monitor
    <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-in fade-in duration-300 font-sans">
      
      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Active Companies (Growth Metric) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50/50 text-[#0f62fe] rounded-xl group-hover:bg-blue-50 transition-colors">
              <Building2 size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Active Companies</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[40px] font-black text-slate-900 leading-none tracking-tight">{stats?.activeCompanies || 0}</h2>
              <p className="text-[13px] font-semibold text-slate-400 mt-2">All regions</p>
            </div>
            {/* Trend Badge */}
            {stats?.trends?.activeCompaniesPct > 0 ? (
               <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                 ▲ {stats.trends.activeCompaniesPct}%
               </span>
            ) : trends.newCompanies > 0 ? (
               <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                 ▲ {trends.newCompanies} recent
               </span>
            ) : null}
          </div>
        </div>

        {/* 2. Suspended Companies (Actionable Alert Metric) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-50/50 text-red-500 rounded-xl group-hover:bg-red-50 transition-colors">
              <Ban size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Suspended</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[40px] font-black text-slate-900 leading-none tracking-tight">{stats?.suspendedCompanies || 0}</h2>
              <p className="text-[13px] font-semibold text-slate-400 mt-2">Pending review</p>
            </div>
            {/* 🚨 PRO FIX: Static Attention Badge per Figma logic */}
            {stats?.suspendedCompanies > 0 && (
              <span className="text-[10px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-md uppercase tracking-widest">
                Attention
              </span>
            )}
          </div>
        </div>

        {/* 3. Total Users (Growth Metric) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-50/50 text-purple-600 rounded-xl group-hover:bg-purple-50 transition-colors">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Total Users</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[40px] font-black text-slate-900 leading-none tracking-tight">{stats?.totalUsers || 0}</h2>
              <p className="text-[13px] font-semibold text-slate-400 mt-2">Across all companies</p>
            </div>
            {/* Trend Badge */}
            {stats?.trends?.newUsersCount > 0 ? (
               <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                 ▲ {stats.trends.newUsersCount} this month
               </span>
            ) : trends.newUsers > 0 ? (
               <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                 ▲ {trends.newUsers} this month
               </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* 📋 RECENT ACTIVITIES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activities</h3>
          <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-full uppercase tracking-wide">
            Live Updates
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentActivities.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-[13px] font-semibold text-slate-400">
                    No recent activities found in the system.
                  </td>
                </tr>
              ) : (
                recentActivities.map((activity) => (
                  <TableRow 
                    key={activity.id} 
                    company={activity.description.split(' ')[0]} 
                    activity={activity.title} 
                    time={activity.timeText} 
                    type={activity.type} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// 🎨 Polished Table Row
const TableRow = ({ company, activity, time, type }) => {
  let icon, iconBg;
  
  switch (type) {
    case 'company_created':
      icon = <Home size={14} className="text-emerald-600" />; 
      iconBg = "bg-emerald-50 border border-emerald-100"; 
      break;
    case 'company_suspended':
      icon = <Ban size={14} className="text-red-500" />; 
      iconBg = "bg-red-50 border border-red-100"; 
      break;
    case 'inactive_warning':
      icon = <AlertTriangle size={14} className="text-amber-500" />; 
      iconBg = "bg-amber-50 border border-amber-100"; 
      break;
    default:
      icon = <UserPlus size={14} className="text-[#0f62fe]" />; 
      iconBg = "bg-blue-50 border border-blue-100";
  }

  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="px-6 py-4 text-[14px] font-bold text-slate-800">{company}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg shadow-sm ${iconBg}`}>
            {icon}
          </div>
          <span className="text-[13px] font-semibold text-slate-600">{activity}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[12px] font-semibold text-slate-400 text-right">{time}</td>
    </tr>
  );
};

export default Dashboard;