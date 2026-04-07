import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Filter, Calendar, Trash2, ChevronDown, Loader2, X, RefreshCw } from 'lucide-react';
import { dprService } from '../services/dpr.service';
import CreateDPRModal from '../components/CreateDPRModal';
import CreateWPRModal from '../components/CreateWPRModal';
import DPRDetailsModal from '../components/DPRDetailsModal';

const DPRListPage = () => {
  const { projectId } = useParams();
  const [reportType, setReportType] = useState('DPR');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetailsId, setLoadingDetailsId] = useState(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [selectedDate, setSelectedDate] = useState(''); 
  const [selectedWeek, setSelectedWeek] = useState('Week 1');
  const [selectedMonthYear, setSelectedMonthYear] = useState(`${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); 
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const filterRef = useRef(null);

  // Click Outside to close filter dropdown
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
      if (reportType === 'DPR') {
        const queryParams = { 
            page: "1", 
            limit: "100",
            ...(selectedDate && { startDate: selectedDate, endDate: selectedDate }),
            ...(statusFilter && { status: statusFilter })
        };
        const response = await dprService.getDPRsByProject(projectId, queryParams);
        let fetchedReports = Array.isArray(response?.data) ? response.data : (Array.isArray(response?.data?.data) ? response.data.data : []);
        setReports(fetchedReports);
      } else {
        const [month, year] = selectedMonthYear.split('/');
        const safeQueryDate = year && month ? `${year}-${month}-01` : new Date().toISOString().split('T')[0];
        try {
            const response = await dprService.getWeeklyReport(projectId, safeQueryDate);
            const fetchedWPRs = Array.isArray(response?.data) ? response.data : (Array.isArray(response?.data?.data) ? response.data.data : []);
            setReports(fetchedWPRs);
        } catch (err) {
            setReports([]); 
        }
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [projectId, reportType, selectedDate, selectedMonthYear, statusFilter]);

  const handleOpenDetails = async (report) => {
    if (isDeleteMode) return; 
    
    if (reportType === 'DPR') {
        setLoadingDetailsId(report.id); 
        try {
            // 1. Fetch main DPR details
            const fullDetails = await dprService.getDPRById(report.id);
            let actualData = fullDetails?.data?.data || fullDetails?.data || report;

            // 2. Fetch specific Photos & Docs from the backend photo route
            try {
                const photoResponse = await dprService.getDPRPhotos(report.id);
                // Based on your controller: res.json({ data: { photos: [...] } })
                const fetchedPhotos = photoResponse?.data?.photos || photoResponse?.data?.data?.photos || [];
                
                // Merge photos into the actualData object before passing to the modal
                actualData = {
                    ...actualData,
                    photos: fetchedPhotos
                };
            } catch (photoErr) {
                console.error("Failed to fetch specific DPR photos:", photoErr);
            }

            setSelectedReport(actualData);
        } catch (error) {
            console.error("Failed to fetch full DPR details:", error);
            setSelectedReport(report); 
        } finally {
            setLoadingDetailsId(null);
            setIsDetailsModalOpen(true);
        }
    }
  };

  const handleDeleteRow = async (e, id) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to permanently delete this report?")) {
        try {
            if (reportType === 'DPR') await dprService.deleteDPR(id);
            else await dprService.deleteWPR(id);
            fetchReports();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete report.");
        }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-in fade-in duration-500 min-h-[500px]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        
        {/* Figma Exact Pill Toggle */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-full w-fit">
          <button 
            onClick={() => setReportType('DPR')}
            className={`px-8 py-2 rounded-full text-xs font-black transition-all uppercase tracking-widest ${reportType === 'DPR' ? 'bg-[#0066CC] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            DPR
          </button>
          <button 
            onClick={() => setReportType('WPR')}
            className={`px-8 py-2 rounded-full text-xs font-black transition-all uppercase tracking-widest ${reportType === 'WPR' ? 'bg-[#0066CC] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            WPR
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Sync Latest Data Button */}
          <button onClick={fetchReports} className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Sync Real-Time Data">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {reportType === 'DPR' ? (
            <div className="relative flex-1 md:flex-none">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500 w-full cursor-pointer"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative">
                <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer">
                  <option>Week 1</option><option>Week 2</option><option>Week 3</option><option>Week 4</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="MM/YYYY" value={selectedMonthYear} onChange={(e) => setSelectedMonthYear(e.target.value)} className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none w-32" />
              </div>
            </div>
          )}

          {/* Filter Dropdown with Click Outside */}
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
                      <button onClick={() => { setStatusFilter('COMPLETED'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg mb-1 ${statusFilter === 'COMPLETED' ? 'bg-[#F1F5F9] text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>Approved</button>
                      <button onClick={() => { setStatusFilter('TODO'); setIsFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg ${statusFilter === 'TODO' ? 'bg-[#F1F5F9] text-[#0066CC]' : 'text-slate-600 hover:bg-slate-50'}`}>Pending</button>
                  </div>
              )}
          </div>
          
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-[#0066CC] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Create {reportType}
          </button>
          
          {/* Delete Mode Toggle */}
          <button 
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className={`p-2.5 border rounded-xl transition-colors ${isDeleteMode ? 'border-red-500 bg-red-500 text-white shadow-md' : 'border-red-100 text-red-500 bg-red-50 hover:bg-red-100'}`}
          >
            {isDeleteMode ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center justify-between">
        <span>{reportType === 'DPR' ? 'Daily Progress Report List' : 'Weekly Progress Report List'}</span>
      </h3>

      <div className="space-y-1">
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400 font-bold italic"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Syncing records...</div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
            No {reportType} records found
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => handleOpenDetails(report)}
              className={`flex items-center justify-between py-5 border-b border-slate-100 transition-all group ${!isDeleteMode && reportType === 'DPR' ? 'cursor-pointer hover:bg-slate-50/50' : ''}`}
            >
              <div className="space-y-1">
                <p className="text-[13px] font-black text-slate-800">
                  {reportType === 'WPR' ? report.title : formatDate(report.date)}
                </p>
                {reportType === 'DPR' && (
                  <p className="text-[11px] font-bold text-slate-400">
                    Prepared by: <span className="text-[#0066CC]">{report.preparedBy?.name || 'Site Engineer'}</span>
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                {loadingDetailsId === report.id && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                
                {isDeleteMode ? (
                    <button onClick={(e) => handleDeleteRow(e, report.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors animate-in zoom-in">
                        <Trash2 className="w-4 h-4" />
                    </button>
                ) : (
                    reportType === 'DPR' && report.status && (
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase ${
                        report.status === 'COMPLETED' || report.status === 'Approved' ? 'bg-[#00A86B] text-white' : 'bg-[#0066CC] text-white'
                      }`}>
                        {report.status === 'COMPLETED' ? 'Approved' : 'Submitted'}
                      </span>
                    )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {reportType === 'DPR' ? (
        <CreateDPRModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} refresh={fetchReports} projectId={projectId} />
      ) : (
        <CreateWPRModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} refresh={fetchReports} projectId={projectId} />
      )}

      <DPRDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        dpr={selectedReport} 
        onDelete={async (id) => {
            if (window.confirm("Delete this report permanently?")) {
                await dprService.deleteDPR(id);
                setIsDetailsModalOpen(false);
                fetchReports();
            }
        }}
      />
    </div>
  );
};

export default DPRListPage;