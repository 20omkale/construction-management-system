import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, History, ClipboardList } from 'lucide-react';
import { dprService } from '../../projects/services/dpr.service';
import InspectionDPRModal from '../components/InspectionDPRModal';

const InspectionListPage = () => {
  const { globalSearch } = useOutletContext();
  const [dprs, setDprs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Toggle between Pending and History
  const [showHistory, setShowHistory] = useState(false);
  
  // Modal State
  const [selectedDpr, setSelectedDpr] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Added showLoader parameter so background polling doesn't cause screen flashing
  const fetchDPRs = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const params = {
        search: globalSearch || localSearch,
        ...(dateFilter && { startDate: dateFilter, endDate: dateFilter })
      };

      const result = await dprService.getDPRsByProject('', params); 
      const dprList = result.data || result;
      setDprs(Array.isArray(dprList) ? dprList : []);
      
    } catch (error) {
      console.error("Error fetching DPRs:", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDPRs(true); // Initial fetch with loader

    // 🚨 SILENT POLLING: Automatically fetches new/updated DPRs every 15 seconds
    // This makes the dashboard truly real-time without needing to refresh the page
    const intervalId = setInterval(() => {
        fetchDPRs(false); 
    }, 15000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [globalSearch, localSearch, dateFilter]);

  const handleViewClick = (dpr) => {
    setSelectedDpr(dpr);
    setIsModalOpen(true);
  };

  const renderStatusBadge = (status) => {
    if (status === 'COMPLETED') return <span className="bg-[#00A86B] text-white text-[11px] px-3 py-1 rounded font-semibold tracking-wide">Approved</span>;
    if (status === 'REJECTED' || status === 'REVIEW') return <span className="bg-[#EF4444] text-white text-[11px] px-3 py-1 rounded font-semibold tracking-wide">Rejected</span>;
    return null; 
  };

  // Filter based on View History toggle
  const displayDPRs = dprs.filter(dpr => {
    const isPending = ['TODO', 'IN_PROGRESS', 'PENDING'].includes(dpr.status);
    return showHistory ? !isPending : isPending;
  });

  return (
    <div className="w-full pt-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        
        {/* Header matches Figma Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Daily Progress Report List</h3>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg text-sm font-semibold transition-colors border border-slate-200/60"
            >
              {showHistory ? <ClipboardList size={16} /> : <History size={16} />}
              {showHistory ? 'View Pending' : 'View History'}
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search" 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200/80 rounded-lg text-sm w-64 focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe]/20 transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div className="relative border border-slate-200/80 rounded-lg px-3 py-2 bg-[#F8FAFC]">
                <input 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-sm text-[#0f62fe] font-medium focus:outline-none cursor-pointer"
                />
            </div>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading reports...</div>
        ) : displayDPRs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {showHistory ? 'No history reports found.' : 'No pending reports found.'}
          </div>
        ) : (
          <div className="space-y-3">
            {displayDPRs.map((dpr) => {
              // Format dates correctly
              const dateStr = new Date(dpr.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const sentDateStr = new Date(dpr.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              
              // 🚨 FIX: Accurately fetches the exact real-time approval/rejection date
              const viewedDateStr = dpr.approvedAt 
                 ? new Date(dpr.approvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                 : new Date(dpr.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

              const isPending = ['TODO', 'IN_PROGRESS', 'PENDING'].includes(dpr.status);

              return (
                <div key={dpr.id} className="flex justify-between items-center p-4 border border-slate-200/60 rounded-xl hover:shadow-sm transition-all bg-white">
                  <div>
                    <h4 className="font-bold text-slate-900 text-[14px]">{dateStr}</h4>
                    <p className="text-[13px] text-slate-500 mt-1">
                      Prepared by: <span className="text-[#0f62fe]">{dpr.preparedBy?.name || 'Unknown'}</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    {/* View Button OR Status Badge */}
                    {isPending ? (
                      <button 
                        onClick={() => handleViewClick(dpr)}
                        className="bg-[#0f62fe] text-white text-[12px] font-semibold px-6 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                    ) : (
                      renderStatusBadge(dpr.status)
                    )}
                    
                    <div className="flex flex-col items-end">
                       <span className="text-[11px] text-slate-500 font-medium">Sent: {sentDateStr}</span>
                       {/* 🚨 FIX: Renders the dynamic viewed/approved date instead of cloning the sent date */}
                       {!isPending && <span className="text-[11px] text-slate-500 font-medium mt-0.5">Viewed: {viewedDateStr}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <InspectionDPRModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        dpr={selectedDpr}
        onSuccess={() => {
            setIsModalOpen(false);
            fetchDPRs(true); // Hard refresh the UI when action is taken
        }}
      />
    </div>
  );
};

export default InspectionListPage;