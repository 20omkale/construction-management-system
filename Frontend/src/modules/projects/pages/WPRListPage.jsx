import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Filter, Calendar, Trash2, ChevronDown, Loader2, X, RefreshCw } from 'lucide-react';
import { getProjectWPRsAPI } from '../services/wpr.service'; 
import { dprService } from '../services/dpr.service'; 

import CreateWPRModal from '../components/CreateWPRModal';
import WPRDetailsModal from '../components/WPRDetailsModal';

// 🚨 PERMANENT FIX: Robust Date Parser that completely fixes the "List Not Updating" bug
const parseSafeDate = (dateStr) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    
    if (typeof dateStr === 'string') {
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) return new Date(parts[0], parts[1]-1, parts[2]);
            return new Date(parts[2], parts[1]-1, parts[0]);
        }
    }
    return new Date();
};

const WPRListPage = () => {
  const { projectId } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [selectedWeek, setSelectedWeek] = useState(''); 
  const [selectedMonthYear, setSelectedMonthYear] = useState(`${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); 
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
        const response = await getProjectWPRsAPI(projectId);
        
        let fetchedWPRs = [];
        if (Array.isArray(response)) fetchedWPRs = response;
        else if (Array.isArray(response?.data)) fetchedWPRs = response.data;
        else if (Array.isArray(response?.data?.data)) fetchedWPRs = response.data.data;
        else if (Array.isArray(response?.data?.wprs)) fetchedWPRs = response.data.wprs;
        else if (Array.isArray(response?.data?.data?.wprs)) fetchedWPRs = response.data.data.wprs;
        else if (Array.isArray(response?.data?.data?.reports)) fetchedWPRs = response.data.data.reports;

        fetchedWPRs.sort((a, b) => parseSafeDate(b.createdAt || b.weekStartDate).getTime() - parseSafeDate(a.createdAt || a.weekStartDate).getTime());
        
        if (selectedMonthYear && fetchedWPRs.length > 0) {
            const [monthStr, yearStr] = selectedMonthYear.split('/');
            const targetMonth = parseInt(monthStr, 10) - 1;
            const targetYear = parseInt(yearStr, 10);

            fetchedWPRs = fetchedWPRs.filter(wpr => {
                if (!wpr.weekStartDate && !wpr.createdAt) return true;
                
                const startD = parseSafeDate(wpr.weekStartDate || wpr.createdAt);
                const endD = parseSafeDate(wpr.weekEndDate || wpr.createdAt);
                
                const startMatch = startD.getMonth() === targetMonth && startD.getFullYear() === targetYear;
                const endMatch = endD.getMonth() === targetMonth && endD.getFullYear() === targetYear;
                
                return startMatch || endMatch;
            });
        }

        if (selectedWeek && selectedWeek !== '' && fetchedWPRs.length > 0) {
            const weekNum = parseInt(selectedWeek.replace('Week ', ''), 10);
            fetchedWPRs = fetchedWPRs.filter(wpr => {
                if (!wpr.weekStartDate && !wpr.createdAt) return true;
                const d = parseSafeDate(wpr.weekStartDate || wpr.createdAt);
                const dateOfMonth = d.getDate();
                const calcWeek = Math.ceil(dateOfMonth / 7);
                const finalWeek = calcWeek > 4 ? 4 : calcWeek;
                return finalWeek === weekNum;
            });
        }
        
        if (statusFilter && fetchedWPRs.length > 0) {
             fetchedWPRs = fetchedWPRs.filter(wpr => (wpr.status || '').toUpperCase() === statusFilter);
        }

        setReports(fetchedWPRs);
    } catch (err) {
        console.error("Failed to fetch WPR list", err);
        setReports([]); 
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [projectId, selectedMonthYear, selectedWeek, statusFilter]);

  const handleOpenDetails = (report) => {
    if (isDeleteMode) return; 
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteRow = async (e, id) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to permanently delete this WPR?")) {
        try {
            await dprService.deleteWPR(id);
            fetchReports();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete report.");
        }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    return parseSafeDate(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-in fade-in duration-500 min-h-[500px]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <h3 className="text-xl font-black text-slate-800">Weekly Progress Reports</h3>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={fetchReports} className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Sync Real-Time Data">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex gap-2">
            <div className="relative">
              <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer">
                <option value="">All Weeks</option>
                <option value="Week 1">Week 1 (1st - 7th)</option>
                <option value="Week 2">Week 2 (8th - 14th)</option>
                <option value="Week 3">Week 3 (15th - 21st)</option>
                <option value="Week 4">Week 4 (22nd+)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="MM/YYYY" value={selectedMonthYear} onChange={(e) => setSelectedMonthYear(e.target.value)} className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none w-32" />
            </div>
          </div>

          <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className={`p-2.5 border rounded-xl transition-colors ${statusFilter || isFilterOpen ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
              >
                <Filter className="w-4 h-4" />
              </button>

              {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-100 rounded-[1rem] shadow-xl z-50 p-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2 mt-2">Filter Status</p>
                      <button onClick={() => { setStatusFilter(''); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg mb-1 ${statusFilter === '' ? 'bg-[#F1F5F9] text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>All Reports</button>
                      <button onClick={() => { setStatusFilter('APPROVED'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg mb-1 ${statusFilter === 'APPROVED' ? 'bg-[#F1F5F9] text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>Approved</button>
                      <button onClick={() => { setStatusFilter('SUBMITTED'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg ${statusFilter === 'SUBMITTED' ? 'bg-[#F1F5F9] text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>Submitted</button>
                  </div>
              )}
          </div>
          
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-[#0066CC] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Create WPR
          </button>
          
          <button 
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className={`p-2.5 border rounded-xl transition-colors ${isDeleteMode ? 'border-red-500 bg-red-500 text-white shadow-md' : 'border-red-100 text-red-500 bg-red-50 hover:bg-red-100'}`}
          >
            {isDeleteMode ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400 font-bold italic"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Syncing records...</div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            No WPR records found for this period
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => handleOpenDetails(report)}
              className={`flex items-center justify-between py-5 border-b border-slate-100 transition-all group ${!isDeleteMode ? 'cursor-pointer hover:bg-slate-50/50' : ''}`}
            >
              <div className="space-y-1">
                <p className="text-[13px] font-black text-slate-800">
                  {`${formatDate(report.weekStartDate || report.createdAt)} to ${formatDate(report.weekEndDate || report.createdAt)}`}
                </p>
                {report.reportNo && (
                  <p className="text-[11px] font-bold text-slate-400">
                    Report No: <span className="text-[#0066CC]">{report.reportNo}</span>
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                {isDeleteMode ? (
                    <button onClick={(e) => handleDeleteRow(e, report.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors animate-in zoom-in">
                        <Trash2 className="w-4 h-4" />
                    </button>
                ) : (
                    report.status && (
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase ${
                        report.status.toUpperCase() === 'APPROVED' ? 'bg-[#00A86B] text-white' : 'bg-[#0066CC] text-white'
                      }`}>
                        {report.status.toUpperCase() === 'APPROVED' ? 'Approved' : 'Submitted'}
                      </span>
                    )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <CreateWPRModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); fetchReports(); }} onSuccess={fetchReports} projectId={projectId} />
      <WPRDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} wpr={selectedReport} />
    </div>
  );
};

export default WPRListPage;